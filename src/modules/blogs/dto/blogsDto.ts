import { IsUrl, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { BlogOwnerInfo } from '../schemas/blogs.schema';

export class BlogsDto {
  @Length(1, 15)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;
  @Length(1, 500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;
  @IsUrl()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  websiteUrl: string;
}

export class BlogsModal_For_DB {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: BlogOwnerInfo,
    public banInfo: {
      isBanned: boolean;
      banDate: Date;
    },
  ) {}
}
