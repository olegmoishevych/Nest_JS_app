import { IsUrl, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

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

export class DB_BlogsType {
  constructor(
    public id: string,
    // public _id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}
