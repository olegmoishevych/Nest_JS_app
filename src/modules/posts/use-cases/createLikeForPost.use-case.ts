import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { LikeStatusDto } from '../dto/createPostDto';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { LikeStatusSQLRepository } from '../repository/likeStatusSQL.repository';
import { LikesEntity } from '../domain/entities/likes.entity';

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

  async execute(command: CreateLikeForPostCommand): Promise<LikesEntity> {
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post)
      throw new NotFoundException([
        { message: 'Post not found', field: 'post' },
      ]);
    const like = await this.likesStatusRepo.findLikeForUser(
      command.user.id,
      command.postId,
    );
    if (!like) {
      return this.likesStatusRepo.createLikeStatusByPostId(
        command.postId,
        command.user,
        command.dto,
      );
    }
    if (like && like.likeStatus !== command.dto.likeStatus) {
      like.likeStatus = command.dto.likeStatus;
      await this.likesStatusRepo.saveResult(like);
    }
  }
}
