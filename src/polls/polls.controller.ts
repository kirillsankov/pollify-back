// src/polls/polls.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
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
    @Body() createPollDto: CreatePollDto,
  ) {
    return this.pollsService.createPoll(user, createPollDto);
  }

  @Get()
  async getAllPolls() {
    return await this.pollsService.getAllPolls();
  }

  @Get(':id')
  async getPoll(@Param('id') pollId: string) {
    return await this.pollsService.getPoll(pollId);
  }

  @Get(':id/results')
  async getResults(@Param('id') pollId: string) {
    return await this.pollsService.getResults(pollId);
  }

  @Post(':id/vote')
  async vote(
    @Param('id') pollId: string,
    @GetUser() user: User,
    @Body() voteDto: VoteDto,
  ) {
    return this.pollsService.vote(pollId, user._id as string, voteDto);
  }

  @Delete(':id')
  async deletePoll(@Param('id') pollId: string, @GetUser() user: User) {
    return await this.pollsService.deletePoll(pollId, user._id as string);
  }
}
