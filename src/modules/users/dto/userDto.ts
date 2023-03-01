import { IsEmail, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UserDto {
  @Length(3, 10)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @Length(6, 20)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string;
}
