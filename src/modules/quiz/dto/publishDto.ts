import { IsBoolean } from 'class-validator';

export class PublishQuestionDto {
  @IsBoolean()
  published: boolean;
}
