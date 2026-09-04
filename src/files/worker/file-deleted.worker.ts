import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FilesService } from '../files.service'; // FilesService'in yolunu kendi projene göre ayarla

@Processor('file-optimization') 
export class FileDeletedWorker extends WorkerHost {
  private readonly logger = new Logger(FileDeletedWorker.name);

  constructor(private readonly filesService: FilesService) {
    super();
  }

  async process(job: Job<any>) {
    if (job.name === 'clean-trash') {
      this.logger.log('🗑️ Gece bekçisi işçi uykudan uyandı, çöp kutusu taranıyor...');
      const result = await this.filesService.cleanExpiredTrash();
      this.logger.log(result.message);
      return result;
    }
  }
}