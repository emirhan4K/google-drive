import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";

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

    @Prop({default:false})
    isPrivate:boolean

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
allowedUsers: Types.ObjectId[];
}

export const SharesSchema = SchemaFactory.createForClass(Shares)

