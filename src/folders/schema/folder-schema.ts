import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

@Schema({timestamps:true})
export class Folder extends Document{

    @Prop({required:true,trim:true})
    name:string

    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    })
    ownerId:string;
    
    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder",
        default: null,
    })
    parentId: string;

}

export const FolderSchema = SchemaFactory.createForClass(Folder)