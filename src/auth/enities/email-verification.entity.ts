import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailVerificationDocument = EmailVerification & Document;

@Schema()
export class EmailVerification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  exp: Date;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);
