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
      .getCount();
  }

  async getCommentsForPostsByUserId(
    dto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<CommentsForPostsViewModal[]>> {
    const blog = await this.blogsTable
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.blogOwnerInfo', 'blogOwnerInfo')
      .addSelect('blog.isUserBanned', 'isUserBanned')
      .where('blogOwnerInfo.id = :id', { id: userId })
      .select('blog.id')
      .getRawOne();
    const postByBlogId = await this.postsTable
      .createQueryBuilder('post')
      .addSelect('post.isUserBanned', 'isUserBanned')
      .where('post.blogId = :blogId', { blogId: blog.blog_id })
      .select('post.id')
      .getRawOne();

    // const com = await this.commentsTable //
    //   .createQueryBuilder('comment')
    //   .leftJoinAndSelect('comment.user', 'user')
    //   .leftJoinAndSelect('user.banInfo', 'userBanInfo')
    //   .where('comment.id = :postId', { postId: postByBlogId.post_id })
    //   .andWhere('userBanInfo.isBanned = false')
    //   .getOne();
    // const commentWithLikes = await this.commentWithLikeStatus(com, userId);
    // console.log('commentWithLikes', commentWithLikes); //

    const builder = this.commentsTable
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.commentatorInfo', 'commentatorInfo')
      .leftJoinAndSelect('comment.postInfo', 'postInfo')
      .addSelect('comment.isUserBanned', 'isUserBanned')
      .where('comment.postId = :postId', {
        postId: postByBlogId.post_id,
      })
      .orderBy(
        `comment.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    const [comments, total] = await builder
      .select([
        'comment.id',
        'comment.content',
        'commentatorInfo.userId',
        'commentatorInfo.userLogin',
        'comment.createdAt',
        'postInfo.id',
        'postInfo.title',
        'postInfo.blogId',
        'postInfo.blogName',
      ])
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
