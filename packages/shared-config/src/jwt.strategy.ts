import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Shared JWT strategy used by all services that need to validate tokens
 * issued by auth-service.  Each service imports JwtAuthModule which
 * registers this strategy against the same JWT_ACCESS_SECRET.
 */
@Injectable()
export class SharedJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET', 'change-me-in-env'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
