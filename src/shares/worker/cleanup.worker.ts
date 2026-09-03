import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import { Shares } from '../schema/shares-schema'; 
import { SHARES_TOKEN_CONSTANTS, FILES_TOKEN_CONSTANTS } from '../../config/db.constants';
import { File } from 'src/files/schema/file-schema'; 
import * as path from 'path';

@Processor('cleanup-queue')
export class CleanupWorker extends WorkerHost {
  private readonly logger = new Logger(CleanupWorker.name);

  constructor(
    @InjectModel(SHARES_TOKEN_CONSTANTS) private sharesModel: Model<Shares>,
    @InjectModel(FILES_TOKEN_CONSTANTS) private fileModel: Model<File> 
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Çöpçü işe başladı! Fiş Tipi: ${job.name}, ShareID: ${job.data.shareId}`);
    
    try {
      if (job.name === 'delete-file') {
        const { shareId, fileId } = job.data;
        const file = await this.fileModel.findById(fileId);
        
        if (file) {
          try {
            const fullFilePath = path.join(process.cwd(), 'uploads', file.fileName);
            await fs.unlink(fullFilePath);
            this.logger.log(`Harddiskten devasa dosya silindi: ${file.fileName}`);
          } catch (fsError) {
            this.logger.warn(`Dosya harddiskte bulunamadı!`);
          }
          await this.fileModel.findByIdAndDelete(fileId);
        }
        await this.sharesModel.findByIdAndDelete(shareId);

        this.logger.log(`Görev tamamlandı: ${shareId} numaralı izler tamamen yok edildi!`);
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Çöp silinirken kritik hata oluştu: ${error.message}`);
      throw error;
    }
  }
}