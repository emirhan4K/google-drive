import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  details: Record<string, any>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);