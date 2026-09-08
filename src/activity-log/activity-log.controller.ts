import { Controller, Get, Req } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log') 
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async getUserActivityLogs(@Req() req: any) {
    const ownerId = req.user.id || req.user.sub;
    return await this.activityLogService.getUserActivityLogs(ownerId);
  }
}