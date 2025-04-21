import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel('Poll') private pollModel: Model<Poll>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async createPoll(user: User, createPollDto: CreatePollDto): Promise<Poll> {
    const { title, questions } = createPollDto;

    const formattedQuestions = questions.map((q) => ({
      text: q.text,
      options: q.options,
      votes: q.options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
      votedUsers: [],
    }));

    const newPoll = new this.pollModel({
      title,
      authorId: user._id,
      authorName: user.username,
      questions: formattedQuestions,
      createAt: new Date(),
      votedUsers: [],
    });

    return await newPoll.save();
  }

  async getAllPolls(): Promise<Poll[]> {
    return await this.pollModel.find().exec();
  }

  async getPoll(id: string): Promise<Poll> {
    const poll = await this.pollModel.findOne({ _id: id }).exec();
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  async vote(pollId: string, userId: string, voteDto: VoteDto): Promise<Poll> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const poll = await this.pollModel.findById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.questions.length !== voteDto.questions.length) {
      throw new BadRequestException('Invalid questions');
    }

    if (poll.votedUsers.includes(userId)) {
      throw new BadRequestException('You have already voted');
    }

    for (let i = 0; i < voteDto.questions.length; i++) {
      const option = voteDto.questions[i];
      const question = poll.questions[+i];

      if (!question || !question.options.includes(option)) {
        throw new BadRequestException('Invalid question or option');
      }

      // if (question.votedUsers.some((id) => id === userId.toString())) {
      //   throw new BadRequestException('You have already voted for this option');
      // }

      question.votes[option] += 1;
      question.votedUsers.push(`${userId.toString()}-${option}`);

      poll.markModified(`questions.${i}`);
    }

    poll.votedUsers.push(userId.toString());

    await poll.save();

    return poll;
  }

  async getResults(pollId: string): Promise<Poll> {
    const poll = await this.pollModel.findById(pollId);
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  async deletePoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.pollModel.findById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not the creator of this poll');
    }
    await this.pollModel.findByIdAndDelete(pollId);
    return poll;
  }
}
