import { IsString } from 'class-validator';

export class VoteDto {
  @IsString()
  questionIndex: string;

  @IsString()
  option: string;
}
