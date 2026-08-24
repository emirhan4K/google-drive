import { Controller, Post, Body, UseGuards,Req, Get} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { VerifyEmailDto } from './dto/verify-email-dto';

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
  forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto:ResetPasswordDto){
    return this.authService.resetPassword(resetPasswordDto)
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto:VerifyEmailDto){
    return this.authService.verifyEmail(verifyEmailDto)
  }


}