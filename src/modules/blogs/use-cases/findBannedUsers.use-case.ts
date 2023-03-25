import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';

@Injectable()
export class FindBannedUsersCommand {
  constructor(
    readonly id: string,
    readonly dto: BannedUserDto,
    readonly user: UserEntity,
  ) {}
}
@CommandHandler(FindBannedUsersCommand)
export class FindBannedUsersUseCase implements ICommand {
  constructor(public blogsRepo: BlogsSqlRepository) {}
  async execute(command: FindBannedUsersCommand) {
    const blog = await this.blogsRepo.findBlogById(command.id);
    if (!blog) throw new NotFoundException(['Blog not found']);
    if (blog.blogOwnerInfo.id !== command.user.id.toString())
      throw new ForbiddenException([]);
    // return this.userBannedRepository.getBannedUsersForBlog(blogId, pagination);
  }
}
