import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface RefreshDocument extends Document {
  token: string;
  userId: string;
  exp: Date;
}
@Schema()
export class Refresh extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  exp: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(Refresh);
