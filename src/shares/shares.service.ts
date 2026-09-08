import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as path from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSharesDto } from './dto/create-shares.dto';
import * as crypto from 'crypto';
import * as fs from 'fs'
import { StreamableFile } from '@nestjs/common';
import { FILES_TOKEN_CONSTANTS, SHARES_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { Shares } from './schema/shares-schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SharesService {
  constructor(
    @InjectModel(SHARES_TOKEN_CONSTANTS)
    private sharesModel: Model<Shares>,
    @InjectModel(FILES_TOKEN_CONSTANTS)
    private fileModel : Model <File>,
    private jwtService: JwtService,
  ) {}

  async getShareDownloadInfo(token: string,currentUserId?:string) {
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
    if(shareRecord.isPrivate){
      if(!currentUserId){
        throw new UnauthorizedException('Bu gizli bir dosyadır. İndirmek için giriş yapmalısınız!')
      }
      const isOwner = shareRecord.ownerId.toString() === currentUserId;
      const isAllowed = shareRecord.allowedUsers.some((allowedId)=> allowedId.toString() === currentUserId);
      if(!isOwner && !isAllowed){
        throw new ForbiddenException('Bu gizli dosyayı indirme veya görüntüleme yetkiniz yok!');
      }
    }
    shareRecord.downloadCount += 1;
    await shareRecord.save();
    // Dosyanın sunucudaki tam yolunu bulduk
    const fileData = shareRecord.fileId as any;
    const filePath = path.join(process.cwd(), 'uploads', fileData.fileName);
    const fileStream =  fs.createReadStream(filePath) //Streami oluşturuyoruz
    return {
      file: new StreamableFile(fileStream), //StreamableFile Saf Node.jsin, NestJS'in anlayabileceği 
      originalName:fileData.originalName // ve web tarayıcısına bağlayabileceği güvenli bir kılıfa sokuyoruz.
    }
  }
  async postSharesLink(ownerId: string, createSharesDto: CreateSharesDto) {
    const file = await this.fileModel.findOne({
      _id:createSharesDto.fileId,
      ownerId:ownerId,
      isDeleted:{$ne:true} //Çöpteki dosyaya link üretmiyoruz
    })
    if(!file){
      throw new NotFoundException('Dosya bulunamadı!')
    }
    const shareToken = crypto.randomUUID();
    const isPrivate = createSharesDto.isPrivate || false;
    const allowedUsers = isPrivate ? (createSharesDto.allowedUsers || []) : [];
    const sharesCreate = await this.sharesModel.create({
      fileId: createSharesDto.fileId,
      ownerId: ownerId,
      token: shareToken,
      expiresAt: createSharesDto.expiresAt,
      maxDownloads: createSharesDto.maxDownloads,
      isPrivate:isPrivate,
      allowedUsers:allowedUsers as any,
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
