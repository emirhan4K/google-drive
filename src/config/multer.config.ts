import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express'; 

//prefix : Dosyanın başına ne eklenecek? ('avatar' veya 'file')
//isImageOnly: Sadece resim mi yüklenecek?
export const getMulterOptions = (prefix: string, isImageOnly: boolean = false) => {
  return {
    storage: diskStorage({
      destination: './uploads',// Dosyaların kaydedileceği klasör
      filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
        const ext = extname(file.originalname); // Dosyanın uzantısını al
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); //Dosyanın adını benzersiz yap ve rastgele bir sayı ekle
        callback(null, `${prefix}-${uniqueSuffix}${ext}`); // Dosya adını oluştur ve callback ile geri döndür
      },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
      if (isImageOnly && !file.mimetype.match(/\/(jpg|jpeg|png)$/)) { // Sadece resim dosyalarına izin ver
        return callback(new BadRequestException('Sadece resim dosyaları (jpg, jpeg, png) yüklenebilir!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: isImageOnly ? 5 * 1024 * 1024 : 500 * 1024 * 1024, // Resimler için 5MB, diğer dosyalar için 500MB
    },
  };
};