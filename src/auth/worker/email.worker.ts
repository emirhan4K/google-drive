import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email-queue') 
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(private readonly mailService: MailService) {
    super(); //WorkerHost sınıfının başlatıcısını çağırıyoruz hata almamak için
  }

  async process(job: Job) {
    this.logger.log(`Postacı işe başladı! İş Tipi: ${job.name}, Alıcı: ${job.data.email}`);
    try {
        if(job.name === 'send-password-reset'){
            await this.mailService.sendPasswordResetEmail(job.data.email, job.data.code);
            this.logger.log(`Postacı işi bitirdi! Mail gönderildi: ${job.data.email}`);
        }
        if(job.name === 'send-verification-email'){
            await this.mailService.sendVerificationEmail(job.data.email, job.data.code);
            this.logger.log(`Postacı işi bitirdi! Mail gönderildi: ${job.data.email}`);
        }
        return { success: true };
    } catch (error) {
        this.logger.error(`Mail gönderilirken hata oluştu: ${error.message}`);
        throw error;
    }
  }
  }