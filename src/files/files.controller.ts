import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Req, Query, Get, Patch, Param, Delete, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path'; 
import { FilesService } from './files.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards'; 
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import type { Response } from 'express';
import { MagicNumberValidationPipe } from './pipes/magic-number-validation.pipe';

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
    @UploadedFile(new MagicNumberValidationPipe()) file: Express.Multer.File,
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

  @Get('download/:id')
  async getDownloadInfo(
    @Param('id') fileId:string,
    @Req() req:any,
    @Res({ passthrough: true }) res:Response,
  ){
    const ownerId = req.user.sub || req.user.id;
    const fileData = await this.filesService.getDownloadInfo(fileId,ownerId);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileData.originalName}"`,
    });
    return fileData.file;
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

  @Get('trash')
  async getTrashFiles(@Req() req:any){
    const ownerId = req.user.id;
    return await this.filesService.getTrashFiles(ownerId)
  }

  @Patch('restored/:id')
  async restoreFile(
    @Param('id') fileId:string,
    @Req() req:any,
  ){
    const ownerId = req.user.id;
    return await this.filesService.restoreFile(fileId,ownerId)
  }


}