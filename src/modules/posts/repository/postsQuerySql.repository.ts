import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../domain/entities/posts.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { LikesEntity } from '../domain/entities/likes.entity';
import { PostsViewModal } from '../schemas/posts.schema';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
  ) {}

  async postsWithLikeStatus(posts: any, userId: string | null) {
    return Promise.all(
      posts.map(async (c) => {
        return this.postWithLikeStatus(c, userId);
      }),
    );
  }

  async postWithLikeStatus(post: any, userId: string | null) {
    post.extendedLikesInfo.likesCount = await this.likesTable.count({
      where: {
        parentId: post.id,
        likeStatus: 'Like',
        isUserBanned: false,
      },
    });
    post.extendedLikesInfo.dislikesCount = await this.likesTable.count({
      where: {
        parentId: post.id,
        likeStatus: 'Dislike',
        isUserBanned: false,
      },
    });
    post.extendedLikesInfo.newestLikes = await this.likesTable.find({
      where: {
        parentId: post.id,
        likeStatus: 'Like',
        isUserBanned: false,
      },
      select: ['addedAt', 'userId', 'login'],
      order: { addedAt: 'DESC' },
      take: 3,
    });
    if (userId) {
      const myStatus = await this.likesTable.findOne({
        where: {
          parentId: post.id,
          userId,
        },
        select: ['likeStatus'],
      });
      post.extendedLikesInfo.myStatus = myStatus ? myStatus.likeStatus : 'None';
    }
    return post;
  }

  async findPosts(userId: string, dto: PaginationDto) {
    const builder = this.postsTable
      .createQueryBuilder('post')
      .addSelect('post.isUserBanned', 'isUserBanned')
      .addSelect('post.isBlogBanned', 'isBlogBanned')
      // .addSelect('post.likeStatus', 'likeStatus')
      .orderBy(
        `post.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .where('post.isUserBanned = :isUserBanned')
      .andWhere('post.isBlogBanned = :isBlogBanned', {
        isUserBanned: false,
        isBlogBanned: false,
      });
    const [posts, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    const postsWithLikes = await this.postsWithLikeStatus(posts, userId);
    return new PaginationViewModel<any>(
      total,
      dto.pageNumber,
      dto.pageSize,
      postsWithLikes,
    );
  }
}
