import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core"; // SetMetadata ile yapıştırılan etiketleri  okur
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(private reflector:Reflector){
        super()
    }

    canActivate(context: ExecutionContext){ 
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler(),//Fonksiyonlara bak
            context.getClass()//Controllera bak 
        ])
        if (isPublic) {
      return true;
    }
    return super.canActivate(context);
    }
    
}