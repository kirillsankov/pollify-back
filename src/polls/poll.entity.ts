// src/polls/poll.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Poll extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  questions: {
    text: string;
    options: string[];
    votes: { [key: string]: number };
    votedUsers: string[];
  }[];

  @Prop({ required: true })
  expiresAt: Date;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
