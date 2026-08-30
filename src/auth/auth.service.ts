import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { VerifyEmailDto } from './dto/verify-email-dto';
import { MailService } from './mail/mail.service';
import { USERS_TOKEN_CONSTANTS } from 'src/config/db.constants';  
import { User } from 'src/users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(USERS_TOKEN_CONSTANTS)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password != registerDto.passwordConfirm) {
      throw new BadRequestException('Şifreler birbiriyle eşleşmiyor!');
    }
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Bu e-posta adresi zaten kullanımda!');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const newUser = new this.userModel({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      verificationCode: verificationCode,
    });
    await newUser.save();
    await this.mailService.sendVerificationEmail(
      registerDto.email,
      verificationCode,
    );
    return {
      message:
        'Kayıt başarılı. Lütfen e-postanıza gönderilen kod ile hesabınızı doğrulayın.',
    };
  }
  async login(loginDto : LoginDto){
     const user = await this.userModel.findOne({email:loginDto.email})
    if(!user){
      throw new UnauthorizedException("E-posta veya şifre hatalı!")
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password); 
    if(!isPasswordValid){
      throw new UnauthorizedException("E-posta veya şifre hatalı!")
    }
    const payload = {sub: user._id, email: user.email}
    const generatedCode = await this.jwtService.signAsync(payload)
    return {access_token : generatedCode}
  }
  async forgotPassword(forgotPasswordDto:ForgotPasswordDto){
    const user = await this.userModel.findOne({email:forgotPasswordDto.email})
    if(!user){
      throw new NotFoundException("Böyle bir kullanıcı bulunamadı!")
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireDate = new Date(Date.now() + 15 * 60 * 1000)

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expireDate;
    await user.save();
    await this.mailService.sendPasswordResetEmail(forgotPasswordDto.email,resetCode )
    return {message : 'Şifre sıfırlama kodu başarıyla e-postanıza gönderildi.'};  
  }
  async resetPassword(resetPasswordDto:ResetPasswordDto){
    if(resetPasswordDto.newPassword != resetPasswordDto.newPasswordConfirm){
      throw new BadRequestException("Şifreler birbiriyle eşleşmiyor!")
    }
    const user = await this.userModel.findOne({
      email:resetPasswordDto.email,
      resetPasswordCode:resetPasswordDto.code,
      resetPasswordExpires:{$gt: new Date()}
    })
    if(!user){
     throw new BadRequestException("Geçersiz veya süresi dolmuş kod!")
    }
    const newHashPassword = await bcrypt.hash(resetPasswordDto.newPassword,10)
    user.password = newHashPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return {message: "Şifreniz başarıyla değiştirildi."}
  }
  async verifyEmail(verifyEmailDto: VerifyEmailDto){
     const user = await this.userModel.findOne({
      email:verifyEmailDto.email,
      verificationCode:verifyEmailDto.code,
      verificationExpires: { $gt: new Date() }
    })
    if(!user){
      throw new BadRequestException("Geçersiz veya süresi dolmuş kod!")
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();
    return {message:"Hesabınız başarıyla doğrulandı."}
  }
}
