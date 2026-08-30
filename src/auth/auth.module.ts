import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserSchema } from '../users/schema/user.schema'
import { MailService } from './mail/mail.service';
import { USERS_TOKEN_CONSTANTS } from 'src/config/db.constants';

@Module({
  imports: [
   MongooseModule.forFeature([{name:USERS_TOKEN_CONSTANTS,schema:UserSchema}]),
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