import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SharesService {
    constructor(
        @InjectModel('Shares')
        private sharesModel: Model<any>,
    ) {}

  async getShareDownloadInfo(token: string) {
    const shareRecord = await this.sharesModel.findOne({
      token: token,
      isActive: true
    }).populate('fileId'); 
    if (!shareRecord) {
      throw new NotFoundException('Bu indirme bağlantısı geçersiz veya süresi dolmuş!');
    }
    const fileData = shareRecord.fileId; 
    const filePath = path.join(process.cwd(), 'uploads', fileData.fileName);
    return {
      filePath: filePath,
      originalName: fileData.originalName
    };
  }
  
}