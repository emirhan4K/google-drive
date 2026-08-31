import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

// Bu sınıfın 'file-optimization' panosundan sorumlu olduğunu belirtiyoruz
@Processor('file-optimization')
export class FileOptimizationProcessor extends WorkerHost { //Sınıfına miras verip "İşlem yarıda kesilirse tekrar dene" diyoruz
  private readonly logger = new Logger(FileOptimizationProcessor.name); //Terminale mesaj basarken başına sarı renkli etiket koyar ve hangi workerdan geldiğini anlar

  async process(job: Job<any>) { //Redisten çekilen fişin job üzerinden almamızı sağlar ve işler çalıştırır(process)
    this.logger.log(`Aşçı işe başladı! İş Tipi: ${job.name}, Dosya ID: ${job.data.fileId}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    this.logger.log(`Aşçı işi bitirdi! Dosya ID: ${job.data.fileId} optimize edildi.`);
    
    // İşlem sorunsuz bittiğinde return atıyoruz, BullMQ bu görevi Redis'ten siliyor (tamamlandı işaretliyor).
    return { success: true };
  }
}