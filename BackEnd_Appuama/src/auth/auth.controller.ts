import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.pass);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.login(user);
    } catch (e) {
      console.error('Error during login:', e);
      throw e;
    }
  }
}
