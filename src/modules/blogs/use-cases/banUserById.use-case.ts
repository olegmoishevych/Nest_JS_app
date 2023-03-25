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
import { UserBannedEntity } from '../domain/entities/user-banned.entity';
import { DeleteResult } from 'typeorm';

@Injectable()
export class BanUserByIdCommand {
  constructor(
    readonly id: string,
    readonly banUserModal: BanUserForBloggerDto,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(BanUserByIdCommand)
export class BanUserByIdUseCase implements ICommandHandler {
  constructor(
    public usersRepo: UsersSqlRepository,
    public blogsRepo: BlogsSqlRepository,
    public bannedUserRepo: UserBannedSQLRepository,
  ) {}

  async execute(command: BanUserByIdCommand) {
    const user = await this.usersRepo.findUserById(command.id);
    if (!user) throw new NotFoundException(['User not found']);
    const blogWithOwner = await this.blogsRepo.findBlogById(
      command.banUserModal.blogId,
    );
    if (!blogWithOwner) throw new NotFoundException(['Blog not found']);
    if (blogWithOwner.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]);
    const bannedUser = await this.bannedUserRepo.findBannedUserById(
      command.user.id,
      blogWithOwner.id,
    );
    if (!bannedUser && command.banUserModal.isBanned === true) {
      return this.bannedUserRepo.createBannedUser(
        command.id,
        blogWithOwner,
        command.banUserModal,
        command.user,
      );
    }
    if (bannedUser && command.banUserModal.isBanned === false) {
      return this.bannedUserRepo.deleteBannedUser(
        command.banUserModal.blogId,
        command.id,
      );
    }
  }
}
