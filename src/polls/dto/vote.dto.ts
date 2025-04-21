import { IsArray, IsString } from 'class-validator';

// export class QuestionVoteDTO {
//   @IsString()
//   questionIndex: string;

//   @IsString()
//   option: string;
// }

export class VoteDto {
  @IsArray()
  @IsString({ each: true })
  questions: string[];
}
