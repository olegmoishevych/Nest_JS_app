import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../domain/comments.entity';
import { Repository } from 'typeorm';
import {
  CommentsForPostsViewModal,
  CommentsViewModal,
} from '../schema/comments.schema';
import { LikesEntity } from '../../posts/domain/entities/likes.entity';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsEntity } from '../../blogs/domain/entities/blogs.entity';
import { PostsEntity } from '../../posts/domain/entities/posts.entity';

@Injectable()
export class CommentsSQLqueryRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsTable: Repository<CommentsEntity>,
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
    @InjectRepository(BlogsEntity)
    private blogsTable: Repository<BlogsEntity>,
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
  ) {}

  async commentsWithLikeStatus(
    commentWithLikeStatus: CommentsEntity[],
    userId: string | null,
  ): Promise<CommentsViewModal[]> {
    return Promise.all(
      commentWithLikeStatus.map(async (c) => {
        return this.commentWithLikeStatus(c, userId);
      }),
    );
  }

  async commentWithLikeStatus(comment: any, userId: string | null) {
    comment.likesInfo.likesCount = await this.likesTable.count({
      where: {
        parentId: comment.id,
        likeStatus: 'Like',
        isUserBanned: false,
      },
    });
    comment.likesInfo.dislikesCount = await this.likesTable.count({
      where: {
        parentId: comment.id,
        likeStatus: 'Dislike',
        isUserBanned: false,
      },
    });
    if (userId) {
      const myStatus = await this.likesTable.findOne({
        where: {
          parentId: comment.id,
          userId,
        },
        select: ['likeStatus'],
      });
      comment.likesInfo.myStatus = myStatus ? myStatus.likeStatus : 'None';
    }
    return comment;
  }

  async findCommentsByPostId(postId: string, dto: PaginationDto) {
    const builder = this.commentsTable
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.commentatorInfo', 'commentatorInfo')
      .addSelect('comment.isUserBanned', 'isUserBanned')
      .addSelect('comment.postId', 'postId')
      .orderBy(
        `comment.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .where('comment.isUserBanned = :isUserBanned')
      .andWhere('comment.postId = :postId', { postId: postId })
      .setParameters({
        isUserBanned: false,
      });
    const [comments, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();

    comments.forEach((comment) => {
      if (comment.commentatorInfo) {
        delete comment.commentatorInfo.id;
      }
    });

    return new PaginationViewModel<CommentsEntity[]>(
      total,
      dto.pageNumber,
      dto.pageSize,
      comments,
    );
  }
  async getCountCollection(postId: string): Promise<number> {
    return this.commentsTable.count({
      where: {
        postId: postId,
      },
    });
  }

  async getCommentsByUserId(
    dto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<CommentsForPostsViewModal[]>> {
    const blog = await this.blogsTable
      .createQueryBuilder('blog')
      // .select('DISTINCT blog.id')
      .where('blog.blogOwnerInfo.userId = :userId', { userId });
    console.log('blog', blog);
    const postByBlogId = await this.postsTable
      .createQueryBuilder('blog')
      .select('DISTINCT blog.id')
      .where('blog.blogId = :blogId', { blog });
    const builder = this.commentsTable
      .createQueryBuilder('comment')
      .orderBy(
        `comment.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      // .where('comment.isUserBanned = :isUserBanned')
      .where('comment.postId = :postId', { postId: postByBlogId });
    // .setParameters({
    //   isUserBanned: false,
    // });
    const [comments, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    return new PaginationViewModel<CommentsForPostsViewModal[]>(
      total,
      dto.pageNumber,
      dto.pageSize,
      comments,
    );
  }
}
