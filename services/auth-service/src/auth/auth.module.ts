import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from './entities/user.entity';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailProcessor],
  exports: [AuthService],
})
export class AuthModule {}
