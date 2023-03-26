import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
    readonly banUserModal: BanUserForBloggerDto,
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
    const blogWithOwner = await this.blogsRepo.findBlogById(
      command.banUserModal.blogId,
    );
    if (!blogWithOwner) throw new NotFoundException();
    if (blogWithOwner.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]);
    const bannedUser = await this.bannedUserRepo.findBannedUserById(
      command.user.id,
      blogWithOwner.id,
    );
    try {
      bannedUser.bannedUser(command.banUserModal, command.user);
      await this.bannedUserRepo.saveResult(bannedUser);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
