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

  async createPoll(
    authorId: string,
    createPollDto: CreatePollDto,
  ): Promise<Poll> {
    const { title, questions, expiresAt } = createPollDto;

    const formattedQuestions = questions.map((q) => ({
      text: q.text,
      options: q.options,
      votes: q.options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
      votedUsers: [],
    }));

    const newPoll = new this.pollModel({
      title,
      authorId,
      questions: formattedQuestions,
      expiresAt: new Date(expiresAt),
    });

    return await newPoll.save();
  }

  async getAllPolls(): Promise<Poll[]> {
    return await this.pollModel.find().exec();
  }

  async vote(pollId: string, userId: string, voteDto: VoteDto): Promise<Poll> {
    const { questionIndex, option } = voteDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const poll = await this.pollModel.findById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const question = poll.questions[+questionIndex];

    if (!question || !question.options.includes(option)) {
      throw new BadRequestException('Invalid question or option');
    }

    if (question.votedUsers.some((id) => id === userId.toString())) {
      throw new BadRequestException('You have already voted for this option');
    }

    question.votes[option] += 1;
    question.votedUsers.push(userId.toString());

    poll.markModified(`questions.${questionIndex}`);

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
