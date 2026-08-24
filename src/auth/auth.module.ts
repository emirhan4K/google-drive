import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../users/schema/user.schema'
import { MailService } from './mail/mail.service';

@Module({
  imports: [
   MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
   JwtModule.register(
    {
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN as any},
      },
   ),
   PassportModule.register({defaultStrategy:'jwt'})
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,MailService],
  exports:[JwtStrategy,PassportModule],
})
export class AuthModule {}