import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Req, Query, Get, Patch, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path'; 
import { FilesService } from './files.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards'; 

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

  @Patch(':id')
  renameFile(
    @Param('id') fileId:string,
    @Body('newName') newName:string,
    @Req() req:any,
  ){
    const ownerId = req.user.id;
    return this.filesService.renameFile(fileId,newName,ownerId)
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