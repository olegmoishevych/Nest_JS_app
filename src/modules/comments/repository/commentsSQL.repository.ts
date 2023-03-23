import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
