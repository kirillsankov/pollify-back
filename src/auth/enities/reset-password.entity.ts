import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface ResetPasswordDocument extends Document {
  userId: string;
  code: string;
  exp: Date;
}

@Schema()
export class ResetPassword extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  exp: Date;
}

export const ResetPasswordSchema = SchemaFactory.createForClass(ResetPassword);
