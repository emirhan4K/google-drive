import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';

@Module({
  imports: [AuthModule, UsersModule, FoldersModule, FilesModule, SharesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
