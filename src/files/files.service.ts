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

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FILES_TOKEN_CONSTANTS) 
    private fileModel: Model<File>,
    @InjectQueue('file-optimization') private optimizationQueue:Queue, //Benim sipariş vereceğim panonun adı bu, bana o panonun yetkilerini ver
  ) {}
  async createFile(file: Express.Multer.File, folderId: string, ownerId: string) {
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
    return newFile;
  }
  async getFiles(ownerId: string, folderId?: string) {
  const files = await this.fileModel.find({
    ownerId: ownerId,
    folderId: folderId || (null as any),
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
    const deleted = await this.fileModel.findOneAndDelete(
      {
        _id:fileId,
        ownerId:ownerId
      }
    )
    if(!deleted){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    const filePath = path.join(process.cwd(),'uploads',deleted.fileName) //Projenin çalıştığı klasörü bul ve işletim sistemine uygun yolları birbirine ekle
    fs.unlinkSync(filePath);  //Dosyayı kalıcı olarak siler ve silinene kadar kodu burada durdurur.
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
 
}