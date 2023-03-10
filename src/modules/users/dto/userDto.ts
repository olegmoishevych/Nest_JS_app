import { IsBoolean, IsEmail, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UserDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  login: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string;
}
export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 1000)
  banReason: string;
}
