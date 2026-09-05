import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Storage extends Document {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
})
  userId: Types.ObjectId;

  @Prop({ required: true, default: 5 * 1024 * 1024 * 1024 }) // 5 GB Toplam Alan 
  totalSpace: number;

  @Prop({ required: true, default: 0 }) //Kullanılan alan
  usedSpace: number;

  @Prop({
    required: true,
    enum: ['FREE', 'PREMIUM', 'ENTERPRISE'],
    default: 'FREE',
  })
  planType: string;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
