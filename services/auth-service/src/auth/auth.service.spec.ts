import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bullmq';
import { AuthService } from './auth.service';
import { UserEntity } from './entities/user.entity';
import { AppRole } from '@syndeocare/shared-types';

// ── Mock bcrypt (avoids native addon dependency in tests) ─────────────────────
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (_data: string, _salt: number) => `hashed:${_data}`),
  compare: jest.fn(async (plain: string, hash: string) => hash === `hashed:${plain}`),
}));
import * as bcrypt from 'bcrypt';
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

// ── Test doubles ──────────────────────────────────────────────────────────────

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockEmailQueue = {
  add: jest.fn().mockResolvedValue(undefined),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

const mockConfigService = {
  get: jest.fn((key: string, fallback?: unknown) => {
    const config: Record<string, unknown> = {
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: undefined,
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      OTP_TTL_SECONDS: 300,
    };
    return config[key] ?? fallback;
  }),
};

// ── Minimal Redis mock ────────────────────────────────────────────────────────
const redisMock: Record<string, string> = {};
const mockRedisInstance = {
  setex: jest.fn((key: string, _ttl: number, val: string) => {
    redisMock[key] = val;
    return Promise.resolve('OK');
  }),
  get: jest.fn((key: string) => Promise.resolve(redisMock[key] ?? null)),
  del: jest.fn((key: string) => {
    delete redisMock[key];
    return Promise.resolve(1);
  }),
};
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedisInstance),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 'user-uuid',
    email: 'test@example.com',
    passwordHash: 'hashed:correctpassword',
    fullName: 'Test User',
    phone: undefined,
    role: AppRole.PROFESSIONAL,
    isEmailVerified: false,
    isActive: true,
    refreshTokenHash: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    Object.keys(redisMock).forEach((k) => delete redisMock[k]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getQueueToken('email'), useValue: mockEmailQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      password: 'Password1!',
      fullName: 'New User',
      role: AppRole.PROFESSIONAL,
      phone: undefined,
    };

    it('creates user, queues events, and returns success message', async () => {
      const savedUser = makeUser({ id: 'new-uuid', email: dto.email });
      mockUserRepo.findOne
        .mockResolvedValueOnce(null)         // register: no existing user
        .mockResolvedValueOnce(savedUser);   // sendOtp: finds the newly created user
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      const result = await service.register(dto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockEmailQueue.add).toHaveBeenCalledTimes(2); // Kafka event + OTP
      expect(result.message).toContain('Registration successful');
    });

    it('throws ConflictException when email already in use', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('hashes password before saving', async () => {
      const savedUser = makeUser({ email: dto.email });
      mockUserRepo.findOne
        .mockResolvedValueOnce(null)        // register: no existing user
        .mockResolvedValueOnce(savedUser);  // sendOtp: finds the user
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      await service.register(dto);

      expect(bcryptMock.hash).toHaveBeenCalledWith(dto.password, expect.any(Number));
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'correctpassword' };

    it('returns tokens for valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser({ passwordHash: 'hashed:correctpassword' }));
      mockUserRepo.update.mockResolvedValue(undefined);

      const result = await service.login(dto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser({ passwordHash: 'hashed:differentpassword' }));

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for inactive account', async () => {
      mockUserRepo.findOne.mockResolvedValue(
        makeUser({ passwordHash: 'hashed:correctpassword', isActive: false }),
      );

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── sendOtp ─────────────────────────────────────────────────────────────────

  describe('sendOtp', () => {
    it('queues OTP email and returns generic message when user exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser());

      const result = await service.sendOtp('test@example.com');

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-otp',
        expect.objectContaining({ to: 'test@example.com' }),
      );
      expect(result.message).toContain('OTP has been sent');
    });

    it('returns generic message even when user does not exist (prevents email enumeration)', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.sendOtp('unknown@example.com');

      expect(mockEmailQueue.add).not.toHaveBeenCalled();
      expect(result.message).toContain('OTP has been sent');
    });
  });

  // ── verifyOtp ───────────────────────────────────────────────────────────────

  describe('verifyOtp', () => {
    it('verifies email and returns tokens for correct OTP', async () => {
      const user = makeUser();
      redisMock['otp:test@example.com'] = '123456';
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user, isEmailVerified: true });
      mockUserRepo.update.mockResolvedValue(undefined);

      const result = await service.verifyOtp('test@example.com', '123456');

      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isEmailVerified: true }),
      );
      expect(result.accessToken).toBeDefined();
    });

    it('throws BadRequestException for wrong OTP', async () => {
      redisMock['otp:test@example.com'] = '999999';

      await expect(service.verifyOtp('test@example.com', '000000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when OTP is expired (not in Redis)', async () => {
      await expect(service.verifyOtp('test@example.com', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('issues new tokens for valid refresh token', async () => {
      mockUserRepo.findOne.mockResolvedValue(
        makeUser({ refreshTokenHash: 'hashed:valid-refresh-token' }),
      );
      mockUserRepo.update.mockResolvedValue(undefined);

      const result = await service.refresh('user-uuid', 'valid-refresh-token');

      expect(result.accessToken).toBe('mock-token');
    });

    it('throws UnauthorizedException when refresh token hash does not match', async () => {
      mockUserRepo.findOne.mockResolvedValue(
        makeUser({ refreshTokenHash: 'hashed:other-token' }),
      );

      await expect(service.refresh('user-uuid', 'wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when user has no stored refresh token', async () => {
      mockUserRepo.findOne.mockResolvedValue(makeUser({ refreshTokenHash: undefined }));

      await expect(service.refresh('user-uuid', 'any-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears refresh token and returns success message', async () => {
      mockUserRepo.update.mockResolvedValue(undefined);

      const result = await service.logout('user-uuid');

      expect(mockUserRepo.update).toHaveBeenCalledWith('user-uuid', { refreshTokenHash: undefined });
      expect(result.message).toContain('Logged out');
    });
  });
});
