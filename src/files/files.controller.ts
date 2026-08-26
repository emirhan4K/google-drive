import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Req, Query, Get, Patch, Param, Delete, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path'; 
import { FilesService } from './files.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards'; 
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', //Dosyanın kaydedileceği yer 
        filename: (req, file, callback) => {
          const ext = extname(file.originalname); //Uzantısını kesip al
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${ext}`); //Parçaları birleştiriyoruz
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Body('folderId') folderId: string, 
    @Req() req: any, 
  ) {

    const ownerId = req.user.id;
    return this.filesService.createFile(file, folderId, ownerId);
  }

  @Get()
  getFiles(
    @Req() req:any,
  @Query('folderId')folderId? : string
  ){
    const ownerId = req.user.id;
    return this.filesService.getFiles(ownerId,folderId)
  }

  @Public()
  @Get('share/:token')
  async getShareDownloadInfo(
    @Param('token') shareToken:string,
    @Res() res:Response
  ){
   const fileData = await this.filesService.getShareDownloadInfo(shareToken);
    res.download(fileData.filePath, fileData.originalName)
  }

  @Get('download/:id')
  async getDownloadInfo(
    @Param('id') fileId:string,
    @Req() req:any,
    @Res() res:Response,
  ){
    const ownerId = req.user.id;
    const fileData = await this.filesService.getDownloadInfo(fileId,ownerId);
    res.download(fileData.filePath, fileData.originalName)
  }

  @Patch(':id')
  renameFile(
    @Param('id') fileId:string,
    @Body('newName') newName:string,
    @Req() req:any,
  ){
    const ownerId = req.user.id;
    return this.filesService.renameFile(fileId,newName,ownerId)
  }

  @Patch(':id/privacy')
  updatePrivacy(
    @Param('id') fileId:string,
    @Body() updatePrivacyDto:UpdatePrivacyDto,
    @Req() req:any
  ){
    const ownerId = req.user.id;
    return this.filesService.updatePrivacy(fileId,updatePrivacyDto,ownerId)
  }

  @Delete(':id')
  deleteFile(
    @Param('id') fileId:string,
    @Req() req:any,
  ){
    const ownerId = req.user.id;
    return this.filesService.deleteFile(fileId,ownerId)
  }



}