import { IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class IpDto {
  @IsString()
  ip: string;
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  title: string;
}
