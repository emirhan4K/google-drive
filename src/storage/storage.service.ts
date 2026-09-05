import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { STORAGE_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { Storage } from './schema/storage.schema';

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(STORAGE_TOKEN_CONSTANTS) private storageModel: Model<Storage>,
  ) {}

  async initializeStorage(userId: string) { //Yeni kullanıcıya 5GB'lik alan 
    const newStorage = new this.storageModel({
      userId: new Types.ObjectId(userId),
    });
    return await newStorage.save();
  }
  async checkQuota(userId: string, incomingFileSize: number) { //Yüklemeden Önce Yer Var Mı Diye Kontrol Et
    const storage = await this.storageModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!storage) {
      throw new NotFoundException('Kullanıcıya ait kota bilgisi bulunamadı!');
    }

    const availableSpace = storage.totalSpace - storage.usedSpace;
    
    if (incomingFileSize > availableSpace) { // Eğer yüklenmek istenen dosya, kalan boş alandan büyükse işlemi durdur
      throw new BadRequestException('Yetersiz depolama alanı! Lütfen dosya silerek yer açın.');
    }
    return true; 
  }
  async updateUsedSpace(userId: string, sizeChange: number) { // Dosya Yüklendiğinde veya Silindiğinde Miktarı Güncelle
    await this.storageModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $inc: { usedSpace: sizeChange } } 
    );
  }
  async getStorageInfo(userId: string) { //Kullanıcıların güncel kota durumları
    const storage = await this.storageModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!storage) {
      throw new NotFoundException('Kota bilgisi bulunamadı!');
    }
    const availableSpace = storage.totalSpace - storage.usedSpace; //Boş alan hesabı = Toplam alan - kullanılan alan 
    //Doluluk yüzdesi = Kullanılan alanı toplam alana bölüyoruz. Çıkan sonucu 100 le çarparak yüzdelik dilime çeviriyoruz. Virgülden sonra 2 basamağı bırak.
    const percentage = ((storage.usedSpace / storage.totalSpace) * 100).toFixed(2); 
    
    return {
      totalSpace: storage.totalSpace,
      usedSpace: storage.usedSpace,
      availableSpace: availableSpace,
      usagePercentage: parseFloat(percentage), 
      planType: storage.planType, 
    };
  }
}