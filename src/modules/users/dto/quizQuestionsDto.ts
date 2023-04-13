import { IsArray, IsString, Length } from 'class-validator';

export class QuizQuestionsDto {
  @IsString()
  @Length(10, 500)
  body: string;
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
