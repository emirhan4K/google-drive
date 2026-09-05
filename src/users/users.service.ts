import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USERS_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
@Injectable()
export class UsersService {
    constructor(
    @InjectModel(USERS_TOKEN_CONSTANTS) private userModel:Model<User>,
    @InjectQueue('avatar-optimization') private optimizationQueue: Queue,
) {}

async updateAvatar(userId:string,newAvatarName:string){
    const user = await this.userModel.findById(userId);
    if(!user){
        throw new NotFoundException('Kullanıcı bulunamadı!');
    }
    if(user.avatar){
        const oldFilePath = path.join(process.cwd(), 'uploads', user.avatar);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
    }
    user.avatar = newAvatarName;
    await user.save();
    await this.optimizationQueue.add('optimize-image',{
        fileId: user._id,
        fileName:user.avatar,
        type:'avatar',
        message:"Profil fotoğrafı : 150x150 boyutunda kırpılacak ve optimize edilecektir."
    })
    return {
        message:'Profil fotoğrafı başarıyla güncellendi.',
        avatar:user.avatar
    }
}
async deleteAvatar(userId:string){
    const user = await this.userModel.findById(userId);
    if(!user){
        throw new NotFoundException('Kullanıcı bulunamadı!');
    }
    if(!user.avatar){
        return { message: 'Silinecek bir profil fotoğrafı yok!' };
    }
    const filePath = path.join(process.cwd(), 'uploads', user.avatar);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    user.avatar = null as any;
    await user.save();
    return {
        message:'Profil fotoğrafı başarıyla kaldırıldı.',

    }
}
}
