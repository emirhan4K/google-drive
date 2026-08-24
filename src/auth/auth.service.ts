import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { VerifyEmailDto } from './dto/verify-email-dto'


@Injectable()
export class AuthService {
  constructor
}
