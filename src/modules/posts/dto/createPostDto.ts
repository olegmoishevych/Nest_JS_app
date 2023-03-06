import { IsIn, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreatePostDto {
  @Length(1, 30)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;
  @Length(1, 100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;
  @Length(1, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;
}

export class CreatePostDtoWithBlogId extends CreatePostDto {
  @IsString()
  blogId: string;
}

export class LikeStatusDto {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
