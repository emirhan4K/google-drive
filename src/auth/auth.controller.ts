import { Controller, Post, Body, UseGuards,Req, Get} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { VerifyEmailDto } from './dto/verify-email-dto';
import { JwtAuthGuard } from './guards/jwt-auth-guards';
import  Request from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto:RegisterDto){
    return this.authService.register(registerDto)
  }

  @Post('login')
  login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
    return await this.authService.forgotPassword(forgotPasswordDto)
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto:ResetPasswordDto){
    return await this.authService.resetPassword(resetPasswordDto)
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto:VerifyEmailDto){
    return await this.authService.verifyEmail(verifyEmailDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: Request){
    const authHeader = request.headers['authorization'] as string;
    const token = authHeader.split(' ')[1];
    return await this.authService.logout(token)
  }

}