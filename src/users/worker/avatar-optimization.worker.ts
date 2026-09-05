import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import  sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Processor('avatar-optimization') 
export class AvatarOptimizationWorker extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    const { fileName } = job.data;
    console.log(`[Avatar İşçisi] Yeni profil fotoğrafı geldi: ${fileName}`);
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      console.log('Dosya bulunamadı, işlem iptal!');
      return;
    }

    try {
      const tempOutputPath = path.join(process.cwd(), 'uploads', `temp-${fileName}`); // Geçici dosya yolu
      await sharp(filePath)
        .resize(150, 150, { // Gelen resmi 150x150 boyutuna kırp
          fit: 'cover', // Kırpma modunu belirler
          position: 'center', // Kırpma konumunu belirler
        })
        .jpeg({ quality: 90 }) // JPEG formatında kaydet ve kaliteyi ayarla
        .toFile(tempOutputPath); // Geçici dosyaya kaydet
    
        fs.renameSync(tempOutputPath, filePath); // Geçici dosyayı orijinal dosya ile değiştir

      console.log(`[Avatar İşçisi] Fotoğraf başarıyla 150x150 kırpıldı!`);

    } catch (error) {
      console.error('[Avatar İşçisi] Resmi kırparken hata oluştu:', error);
    }
  }
}