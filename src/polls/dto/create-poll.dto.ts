import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class RequestPollDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  // @IsString()
  // expiresAt: string;
}

export class GeneratePollDto {
  @IsString()
  @Length(3, 1000, {
    message: 'Message prompt must be between 3 and 1000 characters',
  })
  messagePrompt: string;

  @IsNumber()
  @Max(20, { message: 'Number of questions cannot exceed 20' })
  @Min(1, { message: 'Number of questions must be at least 1' })
  numberQuestion: number;
}
