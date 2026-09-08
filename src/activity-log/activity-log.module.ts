import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ACTIVITY_LOG_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { ActivityLogSchema } from './schema/activity-log.schema';

@Module({
  imports:[
MongooseModule.forFeature([{name:ACTIVITY_LOG_TOKEN_CONSTANTS,schema:ActivityLogSchema}])
  ],
  providers: [ActivityLogService],
  controllers: [ActivityLogController]
})
export class ActivityLogModule {}
