import { IsIn, IsNotEmpty, IsString, Length, Min, Validate } from "class-validator";
import { Transform, TransformFnParams } from 'class-transformer';
import { BlogIsExistRule } from "../../blogs/validators/customValidateBlog";

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
  @Validate(BlogIsExistRule)
  blogId: string;
}

export class LikeStatusDto {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
