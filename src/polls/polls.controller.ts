// src/polls/polls.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { RequestPollDto, GeneratePollDto } from './dto/create-poll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { GetUser } from '../decorators/user.decorator';
import { User } from 'src/auth/user.entity';
import { VoteDto } from './dto/vote.dto';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Post()
  async createPoll(
    @GetUser() user: User,
    @Body() createPollDto: RequestPollDto,
  ) {
    return this.pollsService.createPoll(user, createPollDto);
  }

  @Post('/generate')
  @UseGuards(JwtAuthGuard)
  async generatePoolAi(@Body() generatePollDto: GeneratePollDto) {
    return await this.pollsService.generatePool(generatePollDto);
  }

  @Put(':id/update')
  async updatePoll(
    @GetUser() user: User,
    @Param('id') pollId: string,
    @Body() updatePollDto: RequestPollDto,
  ) {
    return await this.pollsService.updatePoll(pollId, updatePollDto, user);
  }

  @Get()
  async getAllPolls(@GetUser() user: User) {
    return await this.pollsService.getAllPolls(user);
  }

  @Get(':id')
  async getPoll(@Param('id') pollId: string, @GetUser() user: User) {
    return await this.pollsService.getPoll(pollId, user);
  }

  @Post(':id/vote')
  async vote(
    @Param('id') pollId: string,
    @GetUser() user: User,
    @Body() voteDto: VoteDto,
  ) {
    return this.pollsService.vote(pollId, user._id as string, voteDto);
  }

  @Get(':id/check-vote')
  async checkVote(@Param('id') pollId: string, @GetUser() user: User) {
    return this.pollsService.checkVote(pollId, user._id as string);
  }

  @Delete(':id')
  async deletePoll(@Param('id') pollId: string, @GetUser() user: User) {
    return await this.pollsService.deletePoll(pollId, user._id as string);
  }
}
