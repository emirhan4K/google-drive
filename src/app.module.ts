import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports:[
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
  providers: [],
})
export class AppModule {}
