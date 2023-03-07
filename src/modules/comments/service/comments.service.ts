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
import { LikeStatusModal } from '../schema/likeStatus.schema';
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
    const findPostById = await this.postsRepository.findPostByIdFromLikesStatus(
      postId,
    );
    if (!findPostById.length) throw new NotFoundException(`Post not found`);
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

  async findCommentById(
    id: string,
    userId: string,
  ): Promise<CommentsViewModal> {
    const findCommentById: any =
      await this.commentsRepository.findCommentByIdFromLikesStatus(id);
    if (!findCommentById.length)
      throw new NotFoundException(`Comment not found`);
    const commentWithLikeStatus =
      await this.likeStatusRepository.commentsWithLikeStatus(
        findCommentById,
        userId,
      );
    return commentWithLikeStatus[0];
  }

  async findCommentByIdAndDelete(
    commentId: string,
    userId: string,
  ): Promise<CommentsViewModal> {
    const findCommentById =
      await this.commentsRepository.findCommentByIdFromLikesStatus(commentId);
    if (!findCommentById)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (findCommentById.commentatorInfo.userId !== userId)
      throw new ForbiddenException([]);
    return this.commentsRepository.deleteCommentById(commentId, userId);
  }

  async updateCommentByCommentId(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<CommentsViewModal> {
    const findCommentById =
      await this.commentsRepository.findCommentByIdFromLikesStatus(commentId);
    if (!findCommentById)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (findCommentById.commentatorInfo.userId !== userId)
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
    const findCommentById = await this.commentsRepository.findCommentById(
      commentId,
    );
    if (!findCommentById)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    const newLikeStatus: LikeStatusModal = {
      parentId: commentId,
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
