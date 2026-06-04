import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.senhaHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senhaHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user.isAprovado) {
        throw new UnauthorizedException('User not approved');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      isAprovado: user.isAprovado,
      posicaoEquipe: user.posicaoEquipe,
      nomeCompleto: user.nomeCompleto,
      matricula: user.matricula,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
