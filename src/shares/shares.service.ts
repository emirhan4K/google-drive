import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSharesDto } from './dto/create-shares.dto';
import * as crypto from 'crypto';

@Injectable()
export class SharesService {
  constructor(
    @InjectModel('Shares')
    private sharesModel: Model<any>,
  ) {}

  async getShareDownloadInfo(token: string) {
    const shareRecord = await this.sharesModel
      .findOne({
        token: token,
        isActive: true,
      })
      .populate('fileId');
    if (!shareRecord) {
      throw new NotFoundException(
        'Bu indirme bağlantısı geçersiz veya süresi dolmuş!',
      );
    }
    if(shareRecord.expiresAt && shareRecord.expiresAt < new Date()){
      throw new ForbiddenException('Bu paylaşım linkinin süresi dolmuş!')
    }
    if(shareRecord.maxDownloads > 0 && shareRecord.downloadCount >= shareRecord.maxDownloads){
      throw new ForbiddenException('Bu dosya maksimum indirme limitine ulaşmış!')
    }
    shareRecord.downloadCount += 1;
    await shareRecord.save();
    const fileData = shareRecord.fileId;
    const filePath = path.join(process.cwd(), 'uploads', fileData.fileName);
    return {
      filePath: filePath,
      originalName: fileData.originalName,
    };
  }
  async postSharesLink(ownerId: string, createSharesDto: CreateSharesDto) {
    const shareToken = crypto.randomUUID();
    const sharesCreate = await this.sharesModel.create({
      fileId: createSharesDto.fileId,
      ownerId: ownerId,
      token: shareToken,
      expiresAt: createSharesDto.expiresAt,
      maxDownloads: createSharesDto.maxDownloads,
    });
    return {
      message: 'Linkiniz başarıyla oluşturuldu.',
      shareUrl: `http://localhost:3000/shares/${shareToken}`,
      details: sharesCreate,
    };
  }
  async getSharesMyLink(ownerId:string){
    const getMyLink = await this.sharesModel.find({ownerId}).populate('fileId')
    return getMyLink;
  }
  async cancelMyLink(shareId:string,ownerId:string){
    const cancel = await this.sharesModel.findOneAndUpdate(
      {
      _id:shareId,
      ownerId,
    },
    {
      isActive:false,
    },
    { new: true } 
  )
  if(!cancel){
    throw new NotFoundException('Link bulunamadı veya yetkisiz erişim!')
  }
  return {message:'Link başarıyla iptal edildi',cancel}
  }
}
