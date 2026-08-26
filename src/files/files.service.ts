import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs'; //Bilgisayardaki dosyalara müdahale etmesini sağlar
import * as path from 'path';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import * as crypto from 'crypto'; //verileri şifreleme, imzalama ve güvenli rastgele değerler üretir

@Injectable()
export class FilesService {
  constructor(
    @InjectModel('File') 
    private fileModel: Model<any>,
  ) {}
  async createFile(file: Express.Multer.File, folderId: string, ownerId: string) {
    const newFile = await this.fileModel.create({
      originalName: file.originalname, 
      fileName: file.filename,       
      mimeType: file.mimetype,    
      size: file.size,
      ownerId: ownerId,       
      folderId: folderId || null,
    });
    return newFile;
  }
  async getFiles(ownerId: string, folderId?: string) {
  const files = await this.fileModel.find({
    ownerId: ownerId,
    folderId: folderId || null, 
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
    return{
      filePath,
      originalName:file.originalName
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
  async getShareDownloadInfo(shareToken:string){
    const fileData = await this.fileModel.findOne({
      shareToken,
      isPublic:true
    })
    if(!fileData){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    const filePath = path.join(process.cwd(),'uploads',fileData.fileName)
    return{
      filePath:filePath,
      originalName:fileData.originalName
    }
  }
}