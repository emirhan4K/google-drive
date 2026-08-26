import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
}