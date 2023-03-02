import { Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CommentsDto {
  @Length(20, 300)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;
}
