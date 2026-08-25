import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UpdateFolderDto } from './dto/update-folder-dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel('Folder')
    private folderModel: Model<any>,
  ) {}

  async createFolder(createFolderDto: CreateFolderDto, ownerId: string) {
    if (createFolderDto.parentId) {
      const topFolder = await this.folderModel.findById(
        createFolderDto.parentId,
      );
      if (!topFolder) {
        throw new NotFoundException('Böyle bir üst klasör bulunamadı!');
      }
    }
    const newFolder = await this.folderModel.create({
      name: createFolderDto.name,
      parentId: createFolderDto.parentId,
      ownerId: ownerId,
    });
    return newFolder;
  }
  async updateFolder(updateFolderDto: UpdateFolderDto, ownerId:string,folderId:string){
    const updated = await this.folderModel.findOneAndUpdate(
        {
            _id:folderId,
            ownerId,
        },
        {
            $set:{
                name:updateFolderDto.name
            }
        },
            {new:true}
    )
    if (!updated) {
  throw new NotFoundException('Klasör bulunamadı veya bu işlem için yetkiniz yok.');
}
    return updated;
  }
  async deleteFolder(folderId:string, ownerId:string){
    const deleted = await this.folderModel.findOneAndDelete(
        {
            _id:folderId,
            ownerId,
        },
    )
    if(!deleted){
        throw new NotFoundException('Klasör bulunamadı veya bu işlem için yetkiniz yok.!')
    }
    await this.folderModel.deleteMany({
        parentId:folderId
    });
    return {message:"Klasör başarıyla silindi."}
  }
 async getFolders(ownerId: string, parentId?: string) {
    if (parentId) {
      const folders = await this.folderModel.find({
        ownerId: ownerId, 
        parentId: parentId, 
      });
      return folders;
    } else {
      const folders = await this.folderModel.find({
        ownerId: ownerId, 
        parentId: null,
      });
      return folders;
    }
  }

}
