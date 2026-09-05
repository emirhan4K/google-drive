import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards'; 

@UseGuards(JwtAuthGuard) 
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('my-quota')
  async getMyQuota(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return await this.storageService.getStorageInfo(userId);
  }
}