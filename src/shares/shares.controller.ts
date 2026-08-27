import { Controller, Get, Post, Body, Patch, Param, Delete,Res, UseGuards, Req } from '@nestjs/common';
import type { Response } from 'express';
import { SharesService } from './shares.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards';
import { CreateSharesDto } from './dto/create-shares.dto';

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
    
    @Post()
    async postSharesLink(
      @Req() req:any,
      @Body() createSharesDto:CreateSharesDto,
    ){
      const ownerId = req.user.id;
      const fileId = createSharesDto
      return this.sharesService.postSharesLink(ownerId,fileId)
    }

    @Get()
    async getSharesMyLink(
      @Req() req:any,
    ){
      const ownerId = req.user.id;
      return this.sharesService.getSharesMyLink(ownerId)
    }

    @Patch(':id')
    async cancelMyLink (
      @Param('id') shareId: string,
      @Req() req:any,
    ){
      const ownerId = req.user.id;
      return this.sharesService.cancelMyLink(shareId,ownerId)
    }


}
