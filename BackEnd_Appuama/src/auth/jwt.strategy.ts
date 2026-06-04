import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Assert that jwtConstants.secret is a string for TypeScript compiler
    if (!jwtConstants.secret) {
      throw new UnauthorizedException('JWT_SECRET is not defined in environment variables.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret as string, // Cast to string to satisfy TypeScript
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      isAprovado: payload.isAprovado,
      posicaoEquipe: payload.posicaoEquipe,
    };
  }
}
