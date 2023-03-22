import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';

export function BlogIsExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIsExistRule,
    });
  };
}

@ValidatorConstraint({ name: 'BlogIsExist', async: false })
@Injectable()
export class BlogIsExistRule implements ValidatorConstraintInterface {
  constructor(private blogRepository: BlogsSqlRepository) {}

  async validate(id: string) {
    const blog = await this.blogRepository.findBlogById(id);
    if (!blog) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog doesn't exist`;
  }
}
