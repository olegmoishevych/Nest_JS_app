import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { CommentsDto } from '../dto/comments.dto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PostsSQLRepository } from '../../posts/repository/postsSQL.repository';
import { UserBannedSQLRepository } from '../../blogs/repository/user-banned.SQL.repository';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';
import { CommentsEntity } from '../domain/comments.entity';

@Injectable()
export class CreateCommentForPostCommand {
  constructor(
    readonly postId: string,
    readonly dto: CommentsDto,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommand {
  constructor(
    public postsRepo: PostsSQLRepository,
    public userBannedRepo: UserBannedSQLRepository,
    public commentsRepo: CommentsSQLRepository,
  ) {}

  async execute(command: CreateCommentForPostCommand) {
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post) throw new NotFoundException([]);
    const userInBanList = await this.userBannedRepo.findBannedUserByBlogId(
      command.user.id,
      post.blogId,
    );
    if (userInBanList) throw new ForbiddenException([]);
    const commentForDb = await this.commentsRepo.createCommentByPostId(
      post,
      command.dto,
      command.user,
    );
    return {
      id: commentForDb.id,
      content: commentForDb.content,
      commentatorInfo: {
        userId: commentForDb.commentatorInfo.userId,
        userLogin: commentForDb.commentatorInfo.userLogin,
      },
      createdAt: commentForDb.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}
