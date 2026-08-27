import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true, unique: true, trim: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  ownerId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  })
  folderId: mongoose.Schema.Types.ObjectId;

  @Prop({default:false})
  isPublic:boolean

  @Prop({default:null})
  shareToken:string
}

export const FileSchema = SchemaFactory.createForClass(File);
