import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shares } from 'src/shares/schema/shares-schema';
import { SHARES_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger('GeceBekcisi');
constructor(
    @InjectModel(SHARES_TOKEN_CONSTANTS) private sharesModel: Model<Shares>,
    @InjectQueue('cleanup-queue') private readonly cleanQueue:Queue
) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug('Bekçi Uyandı: Etrafta süresi dolmuş çöp dosya var mı diye bakıyorum...');
    const now = new Date(); //Sistemin şu anki tarih ve saatini al
    //MongoDB'ye "expiresAt (bitiş tarihi) şu anki saatten daha KÜÇÜK olanları bul!"
    const expiredShares = await this.sharesModel.find({
      expiresAt: { $lt: now }, //lt = Daha küçük olanları bul
    });
    if (expiredShares.length === 0) {
      this.logger.debug('Her yer tertemiz, süresi dolmuş dosya yok.');
      return; 
    }
    this.logger.debug(`Tam ${expiredShares.length} tane süresi dolmuş dosya bulundu!`);
    for(const share of expiredShares){
        await this.cleanQueue.add('delete-file',{
            shareId: share._id, //Silinecek olan dosyanın id'si
            fileId: share.fileId, //Silinecek olan dosyanın id'si
        });
    }
    this.logger.debug('Tüm çöpler panoya asıldı. Bekçi görevini tamamladı ve uykuya dönüyor!');
  }
}