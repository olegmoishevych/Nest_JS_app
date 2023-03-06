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

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}
  async findCommentsByPostId(
    postId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    const findPostById = await this.postsRepository.findPostById(postId);
    if (!findPostById)
      throw new NotFoundException(`Post with ID ${postId} not found`);
    return this.commentsRepository.findCommentsByPostId(postId, paginationDto);
  }
  async findCommentById(id: string): Promise<CommentsViewModal> {
    const findCommentById = await this.commentsRepository.findCommentById(id);
    if (!findCommentById)
      throw new NotFoundException(`Comment with ID ${id} not found`);
    return findCommentById;
  }
  async findCommentByIdAndDelete(
    commentId: string,
    userId: string,
  ): Promise<CommentsViewModal> {
    const findCommentById = await this.commentsRepository.findCommentById(
      commentId,
    );
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
    const findCommentById = await this.commentsRepository.findCommentById(
      commentId,
    );
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
}
