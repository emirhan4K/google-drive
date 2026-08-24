import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            },
        })
    }

    async sendVerificationEmail(userEmail: string , code: string){
        await this.transporter.sendMail({
            from:`"Linktree Destek" <${process.env.EMAIL_USER}>`, //Gönderici ismi ve epostam
            to:userEmail,
            subject:'Linktree Hesabınızı Onaylayın', //Mailin konu başlığı
            html:`
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hoş Geldin!</h2>
          <p>Kayıt işlemini tamamlamak için aşağıdaki onay kodunu kullanabilirsin:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
          <p>Bu kodu kimseyle paylaşma.</p>
        </div>
      `
        })
    }
    async sendPasswordResetEmail(userEmail: string, code:string){
        await this.transporter.sendMail({
             from:`"Linktree Destek" <${process.env.EMAIL_USER}>`, //Gönderici ismi ve epostam
            to:userEmail,
            subject:'Linktree Şifre Sıfırlama', //Mailin konu başlığı
            html:`
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hoş Geldin!</h2>
          <p>Şifre sıfırlama onay kodunuzu kullanabilirsin:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
          <p>Bu kodu kimseyle paylaşma.</p>
        </div>
      `
        })
    }

}