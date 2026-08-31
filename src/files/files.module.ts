import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import {  FileSchema } from './schema/file-schema';
import { FILES_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { BullModule } from '@nestjs/bullmq';
import { FileOptimizationProcessor } from './processors/file-optimization.processor';

@Module({
  imports:[
    BullModule.registerQueue({
      name:'file-optimization'
    }),
    MongooseModule.forFeature([{name:FILES_TOKEN_CONSTANTS,schema:FileSchema}])
  ],
  controllers: [FilesController],
  providers: [FilesService,FileOptimizationProcessor],
})
export class FilesModule {}
