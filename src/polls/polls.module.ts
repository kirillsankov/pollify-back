import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PollSchema } from './poll.entity';
import { UserSchema } from '../auth/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { connectionRedis, QueueName } from 'src/configs/redis.config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AiConsumer } from './polls.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Poll', schema: PollSchema },
      { name: 'User', schema: UserSchema },
    ]),
    BullModule.forRoot({
      connection: connectionRedis,
    }),
    BullModule.registerQueue({
      name: QueueName.POLL_AI,
    }),
    BullBoardModule.forRoot({
      route: '/queues', // Base route for the dashboard
      adapter: ExpressAdapter, // Or FastifyAdapter
    }),
    BullBoardModule.forFeature({
      name: QueueName.POLL_AI, // Register the queue with Bull Board
      adapter: BullMQAdapter as any,
    }),
    AiConsumer,
  ],
  providers: [PollsService],
  controllers: [PollsController],
})
export class PollsModule {}
