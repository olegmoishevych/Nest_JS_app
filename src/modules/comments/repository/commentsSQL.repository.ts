import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CommentsEntity } from '../domain/comments.entity';
import { PostsEntity } from '../../posts/domain/entities/posts.entity';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CommentsDto } from '../dto/comments.dto';

@Injectable()
export class CommentsSQLRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsTable: Repository<CommentsEntity>,
  ) {}
  async createCommentByPostId(
    post: PostsEntity,
    dto: CommentsDto,
    user: UserEntity,
  ): Promise<CommentsEntity> {
    const newComment = CommentsEntity.createCommentByPostId(post, dto, user);
    return this.commentsTable.save(newComment);
  }
  async findCommentById(id: string): Promise<CommentsEntity> {
    return this.commentsTable.findOneBy({ id });
  }
  async deleteCommentById(commentId: string): Promise<DeleteResult> {
    return this.commentsTable.delete({ id: commentId });
  }
  async saveResult(comment: CommentsEntity): Promise<CommentsEntity> {
    return this.commentsTable.save(comment);
  }
}
