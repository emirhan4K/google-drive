import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Redis } from 'ioredis';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient :Redis,
  ) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Gelen http isteklerinin neresine bakacak
        ignoreExpiration: false, 
        secretOrKey: process.env.JWT_SECRET as string, //Aldığı tokenın sahte olup olmadığını kontrol et
        passReqToCallback: true, //Gelen token metnini görebilmesi için (Req) i paslar
    });
  }

  async validate(request:Request,payload: any) { //User içeri alınmadan önce çalışır
    const authHeader = request.headers.authorization as string;
    const token = authHeader.split(' ')[1];
     
    const isBlacklisted = await this.redisClient.get(`blacklist:${token}`); //Redise soruyoruz bu token kara listede var mı ?
    if(isBlacklisted){
      throw new UnauthorizedException('Bu oturum sonlandırılmış! Lütfen tekrar giriş yapınız.')
    }
    return {userId:payload.sub, email:payload.email} //Token kara listede değilse içeri girmesine izin veriyoruz.
  }
}