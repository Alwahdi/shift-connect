import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedJwtStrategy } from './jwt.strategy';

/**
 * Drop-in auth module for every NestJS service that needs to validate JWTs
 * issued by auth-service.
 *
 * Usage: import JwtAuthModule in your AppModule.
 * Then decorate controller routes with @UseGuards(JwtAuthGuard).
 * The JwtAuthGuard in each service still uses AuthGuard('jwt') — this module
 * registers the strategy so the guard resolves correctly.
 *
 * All services share the same JWT_ACCESS_SECRET (injected via ConfigService),
 * so any token issued by auth-service is valid in every service.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'change-me-in-env'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')) as any,
        },
      }),
    }),
  ],
  providers: [SharedJwtStrategy],
  exports: [PassportModule, JwtModule, SharedJwtStrategy],
})
export class JwtAuthModule {}
