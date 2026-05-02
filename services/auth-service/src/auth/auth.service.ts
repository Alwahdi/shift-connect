import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { UserEntity } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { KAFKA_TOPICS, UserRegisteredEvent, AppRole } from '@syndeocare/shared-types';
import { JwtPayload } from './strategies/jwt.strategy';
import { randomInt } from 'crypto';

const OTP_PREFIX = 'otp:';
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      password: config.get<string>('REDIS_PASSWORD'),
    });
  }

  // ─── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
      phone: dto.phone,
    });

    await this.userRepo.save(user);

    // Emit Kafka event via BullMQ (async, reliable)
    await this.emailQueue.add('user-registered-event', {
      topic: KAFKA_TOPICS.AUTH_USER_REGISTERED,
      payload: {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      } satisfies UserRegisteredEvent['payload'],
    });

    // Send OTP email for verification
    await this.sendOtp(dto.email);

    this.logger.log(`User registered: ${user.id} (${user.email})`);

    return { message: 'Registration successful. Check your email for the OTP.' };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ─── OTP ───────────────────────────────────────────────────────────────────

  async sendOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      // Return generic message to prevent email enumeration
      return { message: 'If the email exists, an OTP has been sent.' };
    }

    const otp = randomInt(100000, 1000000).toString();
    const ttl = this.config.get<number>('OTP_TTL_SECONDS', 300);

    await this.redis.setex(`${OTP_PREFIX}${email}`, ttl, otp);

    await this.emailQueue.add('send-otp', {
      to: email,
      subject: 'Your SyndeoCare verification code',
      templateId: 'otp',
      templateData: { otp, fullName: user.fullName, expiryMinutes: ttl / 60 },
    });

    this.logger.log(`OTP sent to ${email}`);
    return { message: 'If the email exists, an OTP has been sent.' };
  }

  async verifyOtp(email: string, otp: string) {
    const stored = await this.redis.get(`${OTP_PREFIX}${email}`);
    if (!stored || stored !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redis.del(`${OTP_PREFIX}${email}`);

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.isEmailVerified = true;
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ─── Refresh ───────────────────────────────────────────────────────────────

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: undefined });
    return { message: 'Logged out successfully' };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async generateTokens(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpiry = this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as unknown as Record<string, unknown>, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiry as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload as unknown as Record<string, unknown>, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken, userId: user.id, role: user.role };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.userRepo.update(userId, { refreshTokenHash: hash });
  }
}
