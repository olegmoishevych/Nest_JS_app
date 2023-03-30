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
import { LikeStatusEnum } from '../schema/likeStatus.schema';
import { BlogsSqlRepository } from '../../blogs/repository/blogs.sql.repository';
import { PostsSQLRepository } from '../../posts/repository/postsSQL.repository';

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
    private blogsSqlRepo: BlogsSqlRepository,
    private postsSqlRepo: PostsSQLRepository,
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
    comment.likesInfo.likesCount = await this.likesTable
      .createQueryBuilder('likes')
      .leftJoinAndSelect('likes.user', 'user')
      .leftJoinAndSelect('user.banInfo', 'banInfo')
      .where('banInfo.isBanned = false')
      .andWhere('likes.parentId = :commentId', { commentId: comment.id })
      .andWhere('likes.likeStatus = :likeStatus', {
        likeStatus: LikeStatusEnum.Like,
      })
      .getCount();
    comment.likesInfo.dislikesCount = await this.likesTable
      .createQueryBuilder('likes')
      .leftJoinAndSelect('likes.user', 'user')
      .leftJoinAndSelect('user.banInfo', 'banInfo')
      .where('banInfo.isBanned = false')
      .andWhere('likes.parentId = :commentId', { commentId: comment.id })
      .andWhere('likes.likeStatus = :likeStatus', {
        likeStatus: LikeStatusEnum.Dislike,
      })
      .getCount();

    if (userId) {
      const myStatus = await this.likesTable
        .createQueryBuilder('likes')
        .leftJoinAndSelect('likes.user', 'user')
        .leftJoinAndSelect('user.banInfo', 'banInfo')
        .where('banInfo.isBanned = false')
        .andWhere('likes.parentId = :commentId', { commentId: comment.id })
        .andWhere('likes.userId = :userId', { userId })
        .select(['likes.likeStatus'])
        .getOne();
      comment.likesInfo.myStatus = myStatus ? myStatus.likeStatus : 'None';
    }
    return comment;
  }

  async findCommentsByPostId(
    postId: string,
    dto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsEntity[]>> {
    const builder = this.commentsTable
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.commentatorInfo', 'commentatorInfo')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.banInfo', 'banInfo')
      .select([
        'comment.id',
        'comment.content',
        'commentatorInfo.userId',
        'commentatorInfo.userLogin',
        'comment.createdAt',
        'comment.likesInfo',
      ])
      .where('banInfo.isBanned = false')
      .orderBy(
        `comment.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .andWhere('comment.postId = :postId', { postId: postId });
    const [comments, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    return new PaginationViewModel<CommentsEntity[]>(
      total,
      dto.pageNumber,
      dto.pageSize,
      comments,
    );
  }
  async getCountCollection(postId: string): Promise<number> {
    return this.commentsTable
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.banInfo', 'banInfo')
      .where('banInfo.isBanned = false')
      .andWhere('comment.postId = :postId', { postId: postId })
      .getRawOne();
  }

  async getCommentsForPostsByUserId(dto: PaginationDto, userId: string) {
    const blog = await this.blogsSqlRepo.findBlogByUserId(userId);
    const post = await this.postsSqlRepo.findPostByBlogId(blog.id);
    const builder = this.commentsTable
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.commentatorInfo', 'commentatorInfo')
      .leftJoinAndSelect('comment.postInfo', 'postInfo')
      .where('comment.postId = :postId', {
        postId: post.id,
      })
      .orderBy(
        `comment.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    const [comments, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    const commentsWithLikes = await this.commentsWithLikeStatus(
      comments,
      userId,
    );
    const mappedComments = commentsWithLikes.map((c: any) => {
      return {
        id: c.id,
        content: c.content,
        commentatorInfo: {
          userId: c.commentatorInfo.userId,
          userLogin: c.commentatorInfo.userLogin,
        },
        createdAt: c.createdAt,
        postInfo: {
          id: c.postInfo.id,
          title: c.postInfo.title,
          blogId: c.postInfo.blogId,
          blogName: c.postInfo.blogName,
        },
        likesInfo: {
          likesCount: c.likesInfo.likesCount,
          dislikesCount: c.likesInfo.dislikesCount,
          myStatus: c.likesInfo.myStatus,
        },
      };
    });
    return new PaginationViewModel<any>(
      total,
      dto.pageNumber,
      dto.pageSize,
      mappedComments,
    );
  }
}
