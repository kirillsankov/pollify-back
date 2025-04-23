import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class CreateOrUpdatePollDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  // @IsString()
  // expiresAt: string;
}
