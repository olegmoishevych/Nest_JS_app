import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../domain/entities/posts.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { LikesEntity } from '../domain/entities/likes.entity';
import { PostsViewModal } from '../schemas/posts.schema';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
  ) {}

  private async postsWithLikeStatus(
    posts: PostsEntity[],
    userId: string | null,
  ): Promise<PostsViewModal[]> {
    return Promise.all(
      posts.map(async (c) => {
        console.log('posts', posts);
        return this.postWithLikeStatus(c, userId);
      }),
    );
  }

  private async postWithLikeStatus(post: any, userId: string | null) {
    post.extendedLikesInfo.likeStatus = await this.likesTable.findOne({
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
      select: ['userId'],
      order: { id: 'DESC' },
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
    console.log('post', post);
    return post;
  }

  async findPosts(userId: string, dto: PaginationDto) {
    const builder = this.postsTable
      .createQueryBuilder('post')
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
    console.log('postsWithLikes', postsWithLikes);
    return {
      pagesCount: Math.ceil(total / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: total,
      items: postsWithLikes,
    };
  }
}
