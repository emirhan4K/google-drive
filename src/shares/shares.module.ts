import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import {SharesSchema } from './schema/shares-schema';
import { FileSchema } from 'src/files/schema/file-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SHARES_TOKEN_CONSTANTS ,FILES_TOKEN_CONSTANTS} from 'src/config/db.constants';
import { BullModule } from '@nestjs/bullmq';
import { CleanupService } from './cron/cleanup.service';
import { CleanupWorker } from './worker/cleanup.worker';

@Module({
  imports:[
    BullModule.registerQueue({
      name:'cleanup-queue',
    }),
    MongooseModule.forFeature([
      {name:SHARES_TOKEN_CONSTANTS,schema:SharesSchema},
      {name:FILES_TOKEN_CONSTANTS,schema:FileSchema}
    ]),
  ],
  controllers: [SharesController],
  providers: [SharesService,CleanupService,CleanupWorker],
})
export class SharesModule {}
