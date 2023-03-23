import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { LikeStatusDto } from '../dto/createPostDto';
import { LikeStatusModalFor_Db } from '../../comments/schema/likeStatus.schema';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { LikesEntity } from '../domain/entities/likes.entity';
import { LikeStatusSQLRepository } from '../repository/likeStatusSQL.repository';

@Injectable()
export class CreateLikeForPostCommand {
  constructor(
    readonly user: UserEntity,
    readonly postId: string,
    readonly dto: LikeStatusDto,
  ) {}
}
@CommandHandler(CreateLikeForPostCommand)
export class CreateLikeForPostUseCase implements ICommand {
  constructor(
    public postsRepo: PostsSQLRepository,
    public likesStatusRepo: LikeStatusSQLRepository,
  ) {}
  async execute(command: CreateLikeForPostCommand): Promise<boolean> {
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post)
      throw new NotFoundException([
        { message: 'Post not found', field: 'post' },
      ]);
    try {
      await this.likesStatusRepo.createLikeStatusByPostId(
        command.postId,
        command.user,
        command.dto,
      );
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
