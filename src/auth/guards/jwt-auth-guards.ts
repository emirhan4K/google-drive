import { ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core"; // SetMetadata ile yapıştırılan etiketleri  okur
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {Redis} from "ioredis";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(
        private reflector:Reflector,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) {
        super();
    }
    async canActivate(context: ExecutionContext): Promise<boolean> { //Geriye bir değer döndüreceğiz 
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler(),//Fonksiyonlara bak
            context.getClass()//Controllera bak 
        ])
        if (isPublic) {
      return true;
    }
    //Passport kontrolü yapar ve token geçerli mi diye bakar
    const isValid = await super.canActivate(context);
    if (!isValid) {
        return false;   
    }

    //Token geçerli ise, tokeni alır ve redis'te blacklistte olup olmadığını kontrol eder
    const request = context.switchToHttp().getRequest(); //Request objesini alır
    const token = this.extractTokenFromHeader(request); //Headerdan gelen saf tokenı alır ve token değişkenine atar
    if (token) {
            const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                throw new UnauthorizedException('Oturumunuz kapatılmış. Lütfen tekrar giriş yapın!');
            }
        }
        return true;
    }
    //Header'dan (Authorization: Bearer <token>) sadece token kısmını koparıp alan yardımcı metod.
    private extractTokenFromHeader(request: any): string | undefined { //Request objesinden tokeni alır
        const [type, token] = request.headers.authorization?.split(' ') ?? []; //Header'dan Bearer ve tokeni ayırır
        return type === 'Bearer' ? token : undefined; //Eğer Bearer ise tokeni döndürür, değilse undefined döndürür
    }
}