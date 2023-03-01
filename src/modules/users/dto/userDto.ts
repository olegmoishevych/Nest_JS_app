import { IsEmail, IsString, Length } from 'class-validator';

export class UserDto {
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @IsString()
  @IsEmail()
  email: string;
}
