import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs'; //Bilgisayardaki dosyalara müdahale etmesini sağlar
import * as path from 'path';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import * as crypto from 'crypto'; //verileri şifreleme, imzalama ve güvenli rastgele değerler üretir
import { FILES_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { File } from './schema/file-schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StreamableFile } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { Types } from 'mongoose';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FILES_TOKEN_CONSTANTS) 
    private fileModel: Model<File>,
    @InjectQueue('file-optimization') private optimizationQueue:Queue,
    private storageService : StorageService,
  ) {}
  async createFile(file: Express.Multer.File, folderId: string, ownerId: string) {
    try {
      await this.storageService.checkQuota(ownerId,file.size)
    } catch (error) {
      const filePath = path.join(process.cwd(), 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error; 
    }
    const newFile = await this.fileModel.create({
      originalName: file.originalname, 
      fileName: file.filename,       
      mimeType: file.mimetype,    
      size: file.size,
      ownerId: ownerId,       
      folderId: folderId || undefined,
    });
    await this.optimizationQueue.add('optimize-image',{ //Redise veri yazma işlemi : ilk parametre işin adı , ikinci parametre data kısmı aşçıya bırakılanlar
      fileId:newFile._id,
      fileName:newFile.fileName,
      message:"Bu dosyanın önizlemesini oluştur ve sıkıştır"
    })
    await this.storageService.updateUsedSpace(ownerId,file.size)
    return newFile;
  }
  async getFiles(ownerId: string, folderId?: string) {
  const files = await this.fileModel.find({
    ownerId: ownerId,
    folderId: folderId || (null as any),
    isDelete:false
  });
  
  return files;
}
  async renameFile(fileId:string, newName:string, ownerId:string){
    const rename = await this.fileModel.findOneAndUpdate(
      {
        _id:fileId,
        ownerId:ownerId
      },
      {
        originalName:newName,
      },
     {new:true} 
)
  if(!rename){
    throw new NotFoundException('Dosya bulunamadı veya bu işlem için yetkiniz yok!')
  }
  return rename;
  }
  async deleteFile(fileId:string, ownerId:string){
    const deleted = await this.fileModel.findOneAndUpdate(
      {
        _id:fileId,
        ownerId:ownerId,
        isDelete:false
      },
      {
        isDeleted:true,
        deleteAt:new Date()
      },
      {new:true}
    )
    if(!deleted){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    return {message:"Dosya başarıyla silindi."}
  }
  async getDownloadInfo(fileId:string,ownerId:string){
    const file = await this.fileModel.findOne(
      {
        _id:fileId,
        ownerId:ownerId
      }
    )
    if(!file){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    const filePath = path.join(process.cwd(),'uploads', file.fileName)
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Dosya veritabanında var ama fiziksel olarak sunucuda bulunamadı!');
    }
    const fileStream = fs.createReadStream(filePath);
    return{
      file: new StreamableFile(fileStream), 
      originalName: file.originalName,
    }
  }
  async updatePrivacy(fileId:string,updatePrivacyDto:UpdatePrivacyDto,ownerId:string){
    const newShareToken = updatePrivacyDto.isPublic ? crypto.randomUUID() : null;
    const privacy = await this.fileModel.findOneAndUpdate(
      {
        _id:fileId,
        ownerId,
      },
      {
        isPublic: updatePrivacyDto.isPublic,
        shareToken:newShareToken
      },
      {new:true}
      
    )
    if(!privacy){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    return privacy;
  }
  async cleanExpiredTrash(){
    //Şuanki tarihten 30 gün öncesi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredFiles = await this.fileModel.find({
      isDeleted:true,
      deleteAt:{$lt:thirtyDaysAgo} //30 gün öncesinden daha eski olan dosyaları bul
    })
    if(expiredFiles.length === 0){
      return {message:"Silinmesi gereken dosya yok!"}
    }
    //Bulunan her dosyayı diskten ve veritabanından sil
    for(const file of expiredFiles){
      const filePath = path.join(process.cwd(),'uploads',file.fileName)
      if(fs.existsSync(filePath)){ //Dosya diste duruyorsa
        fs.unlinkSync(filePath) //Dosyayı sil
      }
      await this.fileModel.deleteOne({_id:file._id}) //Veritabanından sil
    } 
    return {message:`${expiredFiles.length} adet dosya başarıyla silindi!`}
  } 
  async getTrashFiles(ownerId:string){
    const trashFiles = await this.fileModel.find({
      ownerId,
      isDeleted:true
    })
    return trashFiles;
  }
  async restoreFile(fileId:string,ownerId:string){
    const restored = await this.fileModel.findOneAndUpdate(
      {
        _id:fileId,
        ownerId,
        isDeleted:true
      },
      {
        isDeleted:false,
        deleteAt:null
      },
      {new:true}
    )
    if(!restored){
      throw new NotFoundException('Dosya bulunamadı veya bu işlem için yetkiniz yok!')
      }
      return {
      message: 'Dosya başarıyla çöp kutusundan geri yüklendi.',
      file: restored,
    };
  }
  async permanentDeleteFile(fileId:string,ownerId:string){
    const file = await this.fileModel.findOne({
      _id:fileId,
      ownerId,
      isDeleted:true
    });
    if(!file){
      throw new NotFoundException('Dosya bulunamadı veya bu işlem için yetkiniz yok!')
    }
    const fileSize = file.size;
    const filePath = path.join(process.cwd(),'uploads',file.fileName)
    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)
    }
    await this.fileModel.deleteOne({_id:fileId})
    await this.storageService.updateUsedSpace(ownerId, -fileSize); //Silinen dosyanın boyutunu azaltıyoruz
    return {message:"Dosya kalıcı olarak silindi!"}
  }
  async getFolderSize(folderId:string,ownerId:string){
    const result = await this.fileModel.aggregate([ //aggregate: Kendi içine bir array alır
      {
        $match: { //Filtreleme
          folderId: new Types.ObjectId(folderId), //Sadece bu klasöre ait dosyaları bul
          ownerId: new Types.ObjectId(ownerId), //Sadece bu kullanıcıya ait olan dosyaları bul
          isDeleted: { $ne: true } //Silinenleri alma 
        }
      },
      {
        $group: { //Matematiksel İşlem
          _id: null, //Hepsini tek bir grupa birleştir
          totalSize: { $sum: '$size' }, //totalSize adında bir alan oluştur ve size değerlerini ($num )topla
          fileCount: { $sum: 1 } //fileCount adında bir alan oluştur ve banttan geçen her dosya için 1 ekle 
        }
      }
    ]);
    if (result.length > 0) {
      return {
        totalSize: result[0].totalSize,
        fileCount: result[0].fileCount
      };
    }
    return { folderId,totalSizeBytes: 0, fileCount: 0 };
  }
}