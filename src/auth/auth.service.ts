import {
  BadRequestException,
  Inject,
  Injectable,
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
import {Redis} from 'ioredis';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(USERS_TOKEN_CONSTANTS) private userModel: Model<User>,
    @Inject('REDIS_CLIENT') private readonly redisClient:Redis,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
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
    if (!user) {
      return { message: 'Sıfırlama kodu gönderilmiştir.'};
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisClient.set(
      `otp:${forgotPasswordDto.email}`, //ANAHTAR: Başına otp etiketi koy ve e-posta adresini ekle
      resetCode, //DEĞER: İçeriğine oluşturulan kodu ekle
      'EX', //SİHİRLİ KOMUT: (Expire) bu kaydı sonsuza kadar tutma süresi var
      900 //SÜRE: 15 dakika (900 saniye) boyunca geçerli olacak
    );
    await this.emailQueue.add('send-password-reset',{
      email: forgotPasswordDto.email,
      code: resetCode
    })
    return { message: 'Şifre sıfırlama kodu başarıyla e-postanıza gönderildi.' }; 
  }
  async resetPassword(resetPasswordDto:ResetPasswordDto){
    if(resetPasswordDto.newPassword != resetPasswordDto.newPasswordConfirm){
      throw new BadRequestException("Şifreler birbiriyle eşleşmiyor!")
    }
    const redisCode = await this.redisClient.get(`otp:${resetPasswordDto.email}`) //Redisten kodu oku
    if(!redisCode || redisCode !== resetPasswordDto.code){ //Eğer kod yoksa veya girilen kod ile eşleşmiyorsa
      throw new BadRequestException("Geçersiz veya süresi dolmuş kod!")
    }
    const user = await this.userModel.findOne({ email: resetPasswordDto.email });
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }
    const newHashPassword = await bcrypt.hash(resetPasswordDto.newPassword,10)
    user.password = newHashPassword;
    await user.save();
    await this.redisClient.del(`otp:${resetPasswordDto.email}`) //Redisten kodu sil
    return {message:"Şifreniz başarıyla değiştirildi."}
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
  async logout(token:string){
    try {
      const decoded = this.jwtService.decode(token) as any; //tokenın şifresini doğrulamadan sadece içindekileri okuyoruz
      if(decoded && decoded.exp){ //Eğer okunabilen bir token varsa ve bitiş tarihi (exp) bulunuyorsa 
        const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000); //Tokenın bitiş zamanından şuan ki saniyeyi çıkarıp tokenın kalan süresini buluyoruz.
        if(expiresInSeconds > 0) { //tokenın süresi bitmemişse Redise yazıyoru 
          await this.redisClient.set( //Redise bağlan ve yaz
            `blacklist:${token}`, //ANAHTAR : Başına blacklist etiketi koy ve token'ı ekle 
            'true', //DEĞER: İçeriğine true (evet) iptal edildi yazıyoruz
            'EX', //SİHİRLİ KOMUT: (Expire) bu kaydı sonsuza kadar tutma süresi var
            expiresInSeconds //SÜRE: Kalan ömrü kadar saniye tut ve sonra kendini imha et!
          )
        }
      }
      return { message: 'Başarıyla çıkış yapıldı ve oturum sonlandırıldı.' };
    } catch (error) {
      throw new UnauthorizedException('Geçersiz token!');
    }
  }
}
