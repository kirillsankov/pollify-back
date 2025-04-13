import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PollSchema } from './poll.entity';
import { UserSchema } from '../auth/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Poll', schema: PollSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [PollsService],
  controllers: [PollsController],
})
export class PollsModule {}
