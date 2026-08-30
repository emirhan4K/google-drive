import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as FileType from 'file-type';
import * as fs from 'fs';

@Injectable()
export class MagicNumberValidationPipe implements PipeTransform {
  
  async transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Herhangi bir dosya yüklenmedi!');
    }
    const fileInfo = await FileType.fromFile(file.path); //FileType paketini kullanarak dosyanın gerçek türünü tespit et 
    const allowedExtensions = ['jpg', 'png', 'pdf']; //Sisteme yüklemesine izin verilen dosya uzantıları
    
    if (!fileInfo || !allowedExtensions.includes(fileInfo.ext)) { // Dosya türü tespit edilmesiyse ve uzantısı listede yoksa 
        if(fs.existsSync(file.path)){
            fs.unlinkSync(file.path)
        }
      throw new BadRequestException(`Geçersiz veya zararlı dosya türü! (Tespit edilen: ${fileInfo?.ext || 'Bilinmiyor'})`);
    }
    return file;
  }
}