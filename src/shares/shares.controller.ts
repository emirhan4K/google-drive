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
      @Res({ passthrough: true }) res: Response //header koymak için 
    ){
     const { file, originalName } = await this.sharesService.getShareDownloadInfo(shareToken); 
     //Tarayıcıya kargoları yolluyoruz   
    res.set({
      'Content-Type': 'application/octet-stream', // Bu bir dosyadır ekranda açma, indirmeye başla
      'Content-Disposition': `attachment; filename="${originalName}"`, //Dosyayı yeni sekmede değil indirilenler kısmında aç
    })
    return file
    }
    
    @Post()
    async postSharesLink(
      @Req() req:any,
      @Body() createSharesDto:CreateSharesDto,
    ){
      const ownerId = req.user.sub || req.user.id;
      return this.sharesService.postSharesLink(ownerId,createSharesDto)
    }

    @Get()
    async getSharesMyLink(
      @Req() req:any,
    ){
      const ownerId = req.user.sub || req.user.id;
      return this.sharesService.getSharesMyLink(ownerId)
    }

    @Patch(':id')
    async cancelMyLink (
      @Param('id') shareId: string,
      @Req() req:any,
    ){
      const ownerId = req.user.sub || req.user.id;
      return this.sharesService.cancelMyLink(shareId,ownerId)
    }


}
