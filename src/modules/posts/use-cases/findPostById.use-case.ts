import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { PostsQuerySqlRepository } from '../repository/postsQuerySql.repository';

@Injectable()
export class FindPostByIdCommand {
  constructor(readonly userId: string | null, readonly id: string) {}
}

@CommandHandler(FindPostByIdCommand)
export class FindPostByIdUseCase implements ICommand {
  constructor(
    public postsRepo: PostsSQLRepository,
    public postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async execute(command: FindPostByIdCommand) {
    const post = await this.postsRepo.findPostById(command.id);
    if (!post) throw new NotFoundException(`Post not found`);
    const postWithLikeStatus = await this.postsQueryRepo.postWithLikeStatus(
      post,
      command.userId,
    );
    return {
      id: postWithLikeStatus.id,
      title: postWithLikeStatus.title,
      shortDescription: postWithLikeStatus.shortDescription,
      content: postWithLikeStatus.content,
      blogId: postWithLikeStatus.blogId,
      blogName: postWithLikeStatus.blogName,
      createdAt: postWithLikeStatus.createdAt,
      extendedLikesInfo: {
        likesCount: postWithLikeStatus.extendedLikesInfo.likeStatus,
        dislikesCount: postWithLikeStatus.extendedLikesInfo.dislikesCount,
        myStatus: postWithLikeStatus.extendedLikesInfo.myStatus,
        newestLikes: postWithLikeStatus.extendedLikesInfo.newestLikes,
      },
    };
  }
}
