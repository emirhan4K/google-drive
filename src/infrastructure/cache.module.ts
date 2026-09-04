import { Global, Module } from '@nestjs/common';
import { ICacheService } from './cache.service.abstract';
import { KeyvCacheService } from './keyv-cache.service';

@Global() 
@Module({
  providers: [
    {
      provide: ICacheService, // Biri ICacheService'i talep ettiğinde
      useClass: KeyvCacheService, // KeyvCacheService'i kullanmasını sağlıyoruz
    },
  ],
  exports: [ICacheService], 
})
export class CacheModule {}