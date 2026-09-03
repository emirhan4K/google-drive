import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

// Bu sınıfın 'file-optimization' panosundan sorumlu olduğunu belirtiyoruz
@Processor('file-optimization')
export class FileOptimizationWorker extends WorkerHost { //Sınıfına miras verip "İşlem yarıda kesilirse tekrar dene" diyoruz
  private readonly logger = new Logger(FileOptimizationWorker.name); //Terminale mesaj basarken başına sarı renkli etiket koyar ve hangi workerdan geldiğini anlar

  async process(job: Job<any>) { //Redisten çekilen fişin job üzerinden almamızı sağlar ve işler çalıştırır(process)
    this.logger.log(`Aşçı işe başladı! Dosya: ${job.data.fileName}`);
    const originalFilePath = path.join(process.cwd(),'uploads',job.data.fileName) //Dosyanın bilgisayardaki yerini buluyoruz
    if(!fs.existsSync(originalFilePath)){ //Dosya uploads klasöründe yoksa
        this.logger.error(`HATA: Dosya bulunamadı -> ${originalFilePath}`)
        throw new Error('Dosya bulunamadı!')
    }   
    try {
        // Küçük resim (Thumbnail) için yeni bir isim üretiyoruz
        const ext = path.extname(job.data.fileName) //Dosyanın uzantısını al 
        const baseName = path.basename(job.data.fileName,ext) //Dosyanın saf adını alır
        const thumbFileName = `${baseName}-thumb${ext}`; //Yeni bir dosya ürettik 'örnek-thumb.jpg'
        const thumbFilePath = path.join(process.cwd(), 'uploads', thumbFileName); //Oluşturulan Resimin kaydedileceği yer 

        await sharp(originalFilePath) //Orjinal resmi RAM'e alır
        .resize(300,300,{fit:'inside'}) //Resmi 300x300 yap ve kalitesini bozma 
        .toFile(thumbFilePath) //Sıkıştırılan resmi yeni ürettiğimiz isimle kaydeder.
    } catch (error) {
        this.logger.log(`Uyarı: Bu dosya bir resim değil veya işlenemedi (${job.data.fileName})`);
        return { success: false, reason:'Fotoğraf yüklenemedi!' };
    }
  }
}