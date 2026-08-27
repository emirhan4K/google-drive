import { Controller, Get, Post, Body, Patch, Param, Delete,Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { SharesService } from './shares.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards';

@UseGuards(JwtAuthGuard)
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

    @Public()
    @Get(':token')
    async getShareDownloadInfo(
      @Param('token') shareToken:string,
      @Res() res:Response
    ){
     const fileData = await this.sharesService.getShareDownloadInfo(shareToken);
      res.download(fileData.filePath, fileData.originalName)
    }
  
}
