import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserForBloggerDto } from '../dto/bloggerDto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { UserBannedSQLRepository } from '../repository/user-banned.SQL.repository';

@Injectable()
export class BanUserByIdForBlogCommand {
  constructor(
    readonly id: string,
    readonly dto: BanUserForBloggerDto,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(BanUserByIdForBlogCommand)
export class BanUserByIdUseCase implements ICommandHandler {
  constructor(
    public usersRepo: UsersSqlRepository,
    public blogsRepo: BlogsSqlRepository,
    public bannedUserRepo: UserBannedSQLRepository,
  ) {}

  async execute(command: BanUserByIdForBlogCommand) {
    const user = await this.usersRepo.findUserById(command.id);
    if (!user) throw new NotFoundException();
    const blog = await this.blogsRepo.findBlogById(command.dto.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]);
    const bannedUser = await this.bannedUserRepo.findBannedUserByBlogId(
      blog.id,
      command.id,
    );
    if (!bannedUser && command.dto.isBanned) {
      return this.bannedUserRepo.createBannedUser(
        blog,
        command.dto,
        user,
        command.id,
      );
    }
    if (bannedUser && command.dto.isBanned === false) {
      return this.bannedUserRepo.deleteBannedUser(
        command.dto.blogId,
        command.id,
      );
    }
  }
}
