import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import {  FileSchema } from './schema/file-schema';
import { FILES_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { BullModule } from '@nestjs/bullmq';
import { FileOptimizationWorker } from './worker/file-optimization.worker';
import { TrashCleanupCron } from './cron/trash-cleanup.cron';
import { FileDeletedWorker } from './worker/file-deleted.worker';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports:[
    StorageModule,
    BullModule.registerQueue({
      name:'file-optimization'
    }),
    MongooseModule.forFeature([{name:FILES_TOKEN_CONSTANTS,schema:FileSchema}])
  ],
  controllers: [FilesController],
  providers: [FilesService,FileOptimizationWorker,TrashCleanupCron,FileDeletedWorker],
})
export class FilesModule {}
