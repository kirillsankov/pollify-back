import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PollSchema } from './poll.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Poll', schema: PollSchema }])],
  providers: [PollsService],
  controllers: [PollsController],
})
export class PollsModule {}
