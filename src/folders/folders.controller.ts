import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { ICacheService } from 'src/infrastructure/cache.service.abstract';

@Controller('folders')
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly cacheService: ICacheService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createFolder(@Body() createFolderDto: CreateFolderDto, @Req() req: any) {
    const ownerId = req.user.id;
    return this.foldersService.createFolder(createFolderDto, ownerId);
  }

  @Get()
  getFolders(
    @Req() req: any, 
    @Query('parentId') parentId?: string 
  ) {
    const ownerId = req.user.id;
    return this.foldersService.getFolders(ownerId, parentId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateFolder(
    @Body() updateFolderDto: UpdateFolderDto,
    @Param('id') folderId: string,
    @Req() req: any,
  ) {
    const ownerId = req.user.id;
    return this.foldersService.updateFolder(updateFolderDto, ownerId,folderId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteFolder(@Param('id') folderId:string,@Req() req:any){
    const ownerId = req.user.id;
    return this.foldersService.deleteFolder(folderId,ownerId)
  }

  @Get(':id/size')
  async getFolderSizeDetails(
    @Param('id') folderId:string,
    @Req() req:any,
  ){
    const userId = req.user.sub || req.user.id;
    return await this.foldersService.getFolderSizeDetails(folderId, userId);
  }
}
