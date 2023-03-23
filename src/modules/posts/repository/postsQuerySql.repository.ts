import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../domain/entities/posts.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../helpers/dto/pagination.dto';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
  ) {}
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
    return {
      pagesCount: Math.ceil(total / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: total,
      items: posts,
    };
  }
}
