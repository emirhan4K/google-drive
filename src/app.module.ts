import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './shares/cron/cleanup.service';
import { ThrottlerModule,ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports:[
    ThrottlerModule.forRoot([{
      ttl:60000 , // 1 dakika
      limit:10 // 1 dakika içinde 10 istek
    }]),
    ScheduleModule.forRoot(),
    RedisModule,
    BullModule.forRoot({
      connection:{
        host:'localhost',
        port:6379
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true, //ConfigModule global yapıyoruz her yerden erişebilmek için
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        family:4
      }), 
      }),
    AuthModule, UsersModule, FoldersModule, FilesModule, SharesModule],
  controllers: [],
  providers: [CleanupService,{
    provide: APP_GUARD, //Tüm projedeki api isteklerini sınırlamak için APP_GUARD kullanıyoruz
    useClass: ThrottlerGuard,
  }],
})
export class AppModule {}
