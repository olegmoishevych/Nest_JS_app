import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { CommentsViewModal } from '../schema/comments.schema';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { UserModel } from '../../users/schemas/users.schema';
import { LikeStatusModalFor_Db } from '../schema/likeStatus.schema';
import { LikeStatusRepository } from '../../posts/repository/likeStatus.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private likeStatusRepository: LikeStatusRepository,
  ) {}

  async findCommentsByPostId(
    postId: string,
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    const findPostById = await this.postsRepository.findPostById(postId);
    if (!findPostById) throw new NotFoundException(`Post not found`);
    const findAndSortedComments =
      await this.commentsRepository.findCommentsByPostId(postId, paginationDto);
    const commentsWithLikeStatus =
      await this.likeStatusRepository.commentsWithLikeStatus(
        findAndSortedComments.items,
        userId,
      );
    const getUsersCount = await this.commentsRepository.getCountCollection(
      postId,
    );
    return new PaginationViewModel<any>(
      getUsersCount,
      paginationDto.pageNumber,
      paginationDto.pageSize,
      commentsWithLikeStatus,
    );
  }

  async findCommentById(id: string, userId: string) {
    const comment: CommentsViewModal =
      await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException(`Comment not found`);
    return this.likeStatusRepository.commentWithLikeStatus(comment, userId);
  }

  async findCommentByIdAndDelete(
    commentId: string,
    userId: string,
  ): Promise<CommentsViewModal> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException([]);
    return this.commentsRepository.deleteCommentById(commentId, userId);
  }

  async updateCommentByCommentId(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<CommentsViewModal> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException([]);
    return this.commentsRepository.updateCommentById(
      commentId,
      userId,
      content,
    );
  }

  async updateLikeStatusByCommentId(
    commentId: string,
    likeStatus: string,
    user: UserModel,
  ): Promise<CommentsViewModal> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    const newLikeStatus: LikeStatusModalFor_Db = {
      parentId: commentId,
      isUserBanned: false,
      userId: user.id,
      login: user.login,
      likeStatus: likeStatus,
      addedAt: new Date(),
    };
    return this.commentsRepository.updateLikeStatusByCommentId(
      commentId,
      user.id,
      newLikeStatus,
    );
  }
}
