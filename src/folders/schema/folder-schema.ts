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
    ownerId:mongoose.Types.ObjectId;
    
    @Prop({
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder",
        default: null,
    })
    parentId: mongoose.Schema.Types.ObjectId;

}

export const FolderSchema = SchemaFactory.createForClass(Folder)