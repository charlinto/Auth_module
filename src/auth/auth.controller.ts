import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  POST SIGNUP
  @Post('signup')
  async signUp(@Body() signupDato: SignupDto) {
    return this.authService.signup(signupDato);
  }


    //  POST SIGNUP
    @Post('login')
    async login(@Body()credentials: LoginDto) {
      return this.authService.login(credentials);
    }

    @Post('refresh')
    async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
      return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
 
}
