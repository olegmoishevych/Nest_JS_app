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
import { BlogsUserViewModelFor_DB } from '../schemas/user-banned.schema';
import { BlogsEntity } from '../domain/entities/blogs.entity';

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
  ) {}
  async execute(command: BanUserByIdCommand) {
    const user = await this.usersRepo.findUserById(command.id);
    if (!user) throw new NotFoundException(['User not found']);
    const blogWithOwner = await this.blogsRepo.findBlogById(
      command.banUserModal.blogId,
    );
    if (!blogWithOwner) throw new NotFoundException(['Blog not found']);
    if (blogWithOwner.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]); // 403 error
    // const bannedUser = new BlogsEntity();
    // bannedUser.ban(command.banUserModal.blogId, command.banUserModal);

    // const bannedUser: BlogsUserViewModelFor_DB = {
    //   id: id,
    //   login: user.login,
    //   blogId: banUserModal.blogId,
    //   banInfo: {
    //     isBanned: banUserModal.isBanned,
    //     banDate: new Date().toISOString(),
    //     banReason: banUserModal.banReason,
    //   },
    // };
  }
}
