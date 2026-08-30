import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({timestamps:true})
export class Shares extends Document{
    @Prop({
        required:true, 
        type:mongoose.Schema.Types.ObjectId,
        ref:'File'
    })
    fileId:string;

    @Prop({
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    })
    ownerId:string

    @Prop({
        required:true,
        unique:true
    })
    token:string;

    @Prop({})
    expiresAt:Date;

    @Prop({
        default:0
    })
    maxDownloads:number;

    @Prop({
        default:0
    })
    downloadCount:number;

    @Prop({
        default:true
    })
    isActive:boolean;
}

export const SharesSchema = SchemaFactory.createForClass(Shares)

