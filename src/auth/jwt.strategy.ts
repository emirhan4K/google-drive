import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Gelen http isteklerinin neresine bakacak
        secretOrKey: process.env.JWT_SECRET as string //Aldığı tokenın sahte olup olmadığını kontrol et
    });
  }

  async validate(payload: any) { //Token gerçek ve süresi dolmamışsa fonk otomatik çalışacak 
    return {id: payload.sub, email: payload.email} //Payload içindeki verileri alıp dışarı  obje olarak aktarıyoruz.
  }
}