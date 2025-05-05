import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PollSchema } from './poll.entity';
import { UserSchema } from '../auth/enities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { connectionRedis, QueueName } from 'src/configs/redis.config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AiConsumer } from './polls.processor';
import * as basicAuth from 'express-basic-auth';

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
      route: '/queues',
      adapter: ExpressAdapter,
      middleware: [
        basicAuth({
          users: {
            [process.env.USER_NAME || 'user']:
              process.env.USER_PASSWORD || '12345678',
          },
          challenge: true,
        }),
      ],
    }),
    BullBoardModule.forFeature({
      name: QueueName.POLL_AI,
      adapter: BullMQAdapter as any,
    }),
    AiConsumer,
  ],
  providers: [PollsService],
  controllers: [PollsController],
})
export class PollsModule {}
