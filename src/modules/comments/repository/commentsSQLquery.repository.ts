import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../domain/comments.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CommentsViewModal } from '../schema/comments.schema';
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
      .getRawOne();
  }

  async getCommentsForPostsByUserId(
    dto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<CommentsEntity[]>> {
    const where: FindOptionsWhere<CommentsEntity> = {
      postInfo: {
        blog: { blogOwnerInfo: { id: userId, banInfo: { isBanned: false } } },
      },
    };
    const [foundComments, totalCount] = await this.commentsTable.findAndCount({
      where,
      relations: {
        postInfo: true,
      },
      order: { [dto.sortBy]: dto.sortDirection.toUpperCase() },
      skip: (dto.pageNumber - 1) * dto.pageSize,
      take: dto.pageSize,
    });
    const commentsWithLikes = await this.commentsWithLikeStatus(
      foundComments,
      userId,
    );
    const commentsWithPagination = commentsWithLikes.map((c: any) => {
      return {
        id: c.id,
        content: c.content,
        commentatorInfo: {
          userId: c.commentatorInfo.userId,
          userLogin: c.commentatorInfo.userLogin,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: c.likesInfo.likesCount,
          dislikesCount: c.likesInfo.dislikesCount,
          myStatus: c.likesInfo.myStatus,
        },
        postInfo: {
          id: c.postInfo.id,
          title: c.postInfo.title,
          blogId: c.postInfo.blogId,
          blogName: c.postInfo.blogName,
        },
      };
    });

    return new PaginationViewModel<any>(
      totalCount,
      dto.pageNumber,
      dto.pageSize,
      commentsWithPagination,
    );
  }
}
