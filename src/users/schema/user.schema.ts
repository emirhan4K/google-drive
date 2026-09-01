import {Prop , Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps:true})
export class User extends Document{
    @Prop({required:true,trim:true})
    name:string;

    @Prop({required:true,trim:true,unique:true})
    email:string;

    @Prop({required:true})
    password:string;

    @Prop({default:''})
    bio:string

    @Prop({default: false})
    isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);