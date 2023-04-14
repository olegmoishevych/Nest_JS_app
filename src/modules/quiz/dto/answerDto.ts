import { IsString } from 'class-validator';

export class AnswerDto {
  @IsString()
  answer: string;
}
