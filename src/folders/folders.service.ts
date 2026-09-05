import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { FOLDER_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { Folder } from './schema/folder-schema';
import { ICacheService } from 'src/infrastructure/cache.service.abstract';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(FOLDER_TOKEN_CONSTANTS)  private folderModel: Model<Folder>,
    private readonly cacheService: ICacheService,
    private readonly filesService : FilesService
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
    //Klasör oluşturulduktan sonra cache'i temizliyoruz, böylece bir sonraki getFolders çağrısı güncel veriyi alması için
    const cacheKey = `folders:${ownerId}:${createFolderDto.parentId || 'root'}`;
    await this.cacheService.delete(cacheKey); 
    return newFolder;
  }
  async getFolders(ownerId: string, parentId?: string) {
  const cacheKey = `folders:${ownerId}:${parentId || 'root'}`; //Özel bir cache anahtarı oluşturuyoruz
  const cachedFolders = await this.cacheService.get(cacheKey);
  if (cachedFolders) {
    return cachedFolders; // Eğer cache'de varsa, cache'deki veriyi döndür
  }
  const folders = await this.folderModel.find({ //Eğer cache'de yoksa, veritabanından veriyi al
    ownerId: ownerId,
    parentId: parentId || null, 
  });
  await this.cacheService.set(cacheKey, folders,60); // Sonuçları cache'e kaydet ve 60 saniye boyunca sakla
  return folders;
}
  async getFolderSizeDetails(folderId:string,ownerId:string){
    const cacheKey = `folder-size:${ownerId}:${folderId}`;
    const cachedSize = await this.cacheService.get(cacheKey);
    if(cachedSize){
      return cachedSize;
    }
    const folder = await this.folderModel.findOne({
      _id:folderId,
      ownerId,
    })
    if(!folder){
      throw new NotFoundException('Klasör bulunamadı!')
    }
    const sizeInfo = await this.filesService.getFolderSize(folderId,ownerId);
    const result = {
      folderId:folder._id,
      folderName:folder.name,
      totalSize:sizeInfo.totalSize,
      fileCount:sizeInfo.fileCount,
    };
    await this.cacheService.set(cacheKey, result, 60);
    return result;

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
 //Klasör oluşturulduktan sonra cache'i temizliyoruz, böylece bir sonraki getFolders çağrısı güncel veriyi alması için
    const cacheKey = `folders:${ownerId}:${updated.parentId|| 'root'}`;
    await this.cacheService.delete(cacheKey); 
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
    //Silinen klasörün içinde bulunduğu ana listeyi (üst klasörü) temizle
    await this.cacheService.delete(`folders:${ownerId}:${deleted.parentId || 'root'}`);
    
    //Silinen klasörün kendi içindeki alt listesini de temizle (çöp kalmasın)
    await this.cacheService.delete(`folders:${ownerId}:${folderId}`);  
    return {message:"Klasör başarıyla silindi."}
  }
}
