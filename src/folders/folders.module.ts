import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderSchema } from './schema/folder-schema';
import { FOLDER_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports:[
    FilesModule,
    MongooseModule.forFeature([{name:FOLDER_TOKEN_CONSTANTS,schema:FolderSchema}])
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
