import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schema/folder-schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Folder.name,schema:FolderSchema}])
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
