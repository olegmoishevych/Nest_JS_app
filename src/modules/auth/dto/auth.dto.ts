import { IsEmail, IsString, Length, Min } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class AuthDto {
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

export class LoginOrEmailDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  loginOrEmail: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  password: string;
}

export class NewPasswordDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  newPassword: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  recoveryCode: string;
}
