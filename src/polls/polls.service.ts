import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Poll } from './poll.entity';
import { RequestPollDto, GeneratePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { User } from 'src/auth/enities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { connectionRedis, QueueName } from 'src/configs/redis.config';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel('Poll') private pollModel: Model<Poll>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectQueue(QueueName.POLL_AI) private pollAiQueue: Queue,
  ) {}

  async createPoll(user: User, createPollDto: RequestPollDto): Promise<Poll> {
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
      authorEmail: user.email,
      questions: formattedQuestions,
      createAt: new Date(),
      votedUsers: [],
    });

    return await newPoll.save();
  }

  async updatePoll(
    id: string,
    updatePollDto: RequestPollDto,
    user: User,
  ): Promise<Poll> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid poll ID format');
    }
    const poll = await this.pollModel.findById(id);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.authorId !== (user._id as string).toString()) {
      throw new ForbiddenException('You are not the admin of this poll');
    }

    poll.title = updatePollDto.title;

    const existingQuestionsMap = new Map(
      poll.questions.map((q) => [q.text, q]),
    );

    const orderedQuestions = updatePollDto.questions.map((newQ) => {
      const existingQ = existingQuestionsMap.get(newQ.text);

      if (existingQ) {
        const updatedVotes: Record<string, number> = {};

        newQ.options.forEach((option) => {
          if (existingQ.options.includes(option)) {
            updatedVotes[option] = existingQ.votes[option];
          } else {
            updatedVotes[option] = 0;
          }
        });

        existingQ.options = [...newQ.options];
        existingQ.votes = updatedVotes;
        existingQ.votedUsers = existingQ.votedUsers.filter((voteId) => {
          const [, votedOption] = voteId.split('-');
          return existingQ.options.includes(votedOption);
        });

        return existingQ;
      } else {
        return {
          text: newQ.text,
          options: newQ.options,
          votes: newQ.options.reduce<Record<string, number>>((acc, option) => {
            acc[option] = 0;
            return acc;
          }, {}),
          votedUsers: [],
        };
      }
    });

    poll.questions = orderedQuestions;
    poll.markModified('questions');

    return await poll.save();
  }

  async getAllPolls(user: User): Promise<Poll[]> {
    return await this.pollModel
      .find({
        authorId: user._id,
      })
      .exec();
  }

  async getPoll(id: string, user: User): Promise<Poll> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid poll ID format');
    }
    const poll = await this.pollModel.findOne({ _id: id }).exec();
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.authorId !== (user._id as string).toString()) {
      throw new ForbiddenException('You are not the admin of this poll');
    }
    return poll;
  }

  async getShortPoll(id: string, userId: string): Promise<Partial<Poll>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid poll ID format');
    }

    const poll = await this.pollModel
      .findOne({ _id: id }, { title: 1, questions: 1, votedUsers: 1, _id: 1 })
      .exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (userId) {
      const isUserVoted = poll.votedUsers.includes(userId);
      poll.votedUsers = isUserVoted ? [userId] : [];

      poll.questions = poll.questions.map((question) => {
        const userVotes = question.votedUsers.filter((voteId) =>
          voteId.startsWith(`${userId}-`),
        );

        return {
          ...question,
          votedUsers: userVotes,
        };
      });
    }

    return poll;
  }

  async checkVote(
    pollId: string,
    userId: string,
  ): Promise<{ isVoted: boolean; userId: string }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!isValidObjectId(pollId)) {
      throw new BadRequestException('Invalid poll ID format');
    }
    const poll = await this.pollModel.findById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    return {
      isVoted: poll.votedUsers.includes(userId),
      userId: (user._id as string).toString(),
    };
  }

  async vote(pollId: string, userId: string, voteDto: VoteDto): Promise<Poll> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!isValidObjectId(pollId)) {
      throw new BadRequestException('Invalid poll ID format');
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

  async deletePoll(pollId: string, userId: string): Promise<Poll> {
    if (!isValidObjectId(pollId)) {
      throw new BadRequestException('Invalid poll ID format');
    }
    const poll = await this.pollModel.findById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.authorId !== userId.toString()) {
      throw new ForbiddenException('You are not the admin of this poll');
    }
    await this.pollModel.findByIdAndDelete(pollId);
    return poll;
  }

  async generatePool(
    generatePollDto: GeneratePollDto,
  ): Promise<RequestPollDto> {
    const queueEvents = new QueueEvents(QueueName.POLL_AI, {
      connection: connectionRedis,
    });
    const job = await this.pollAiQueue.add(
      `${QueueName.POLL_AI}Job`,
      generatePollDto,
    );
    return (await job.waitUntilFinished(queueEvents)) as RequestPollDto;
  }
}
