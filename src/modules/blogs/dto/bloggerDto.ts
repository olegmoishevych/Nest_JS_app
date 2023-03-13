import { IsString, Validate } from 'class-validator';
import { BanUserDto } from '../../users/dto/userDto';
import { BlogIsExistRule } from '../validators/customValidateBlog';

export class BanUserForBloggerDto extends BanUserDto {
  @IsString()
  @Validate(BlogIsExistRule)
  blogId: string;
}
