import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityLog } from './schema/activity-log.schema';
import { ACTIVITY_LOG_TOKEN_CONSTANTS } from 'src/config/db.constants';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ACTIVITY_LOG_TOKEN_CONSTANTS) private activityLogModel: Model<ActivityLog>
  ) {}

  @OnEvent('user.action') //user.action komutunu dinle 
  async handleUserAction(payload: { ownerId: string; action: string; details: any }) {
    try {
      await this.activityLogModel.create({
        ownerId: payload.ownerId,
        action: payload.action,
        details: payload.details,
      });
      console.log(`📝 [Activity Log] Kaydedildi: ${payload.action}`);
    } catch (error) {
      console.error('[Activity Log Hata] Log yazılamadı:', error);
    }
  }
}