import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogsEntity } from '../domain/entities/blogs.entity';
import { Repository } from 'typeorm';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';

@Injectable()
export class BlogsSQLqueryRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    private blogsTable: Repository<BlogsEntity>,
  ) {}

  async getBlogsForPublic(
    query: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const builder = this.blogsTable
      .createQueryBuilder('blogs')
      // .leftJoinAndSelect('b.banInfo', 'banInfo')
      // .addSelect('b.banInfo', 'b.banInfo')
      .orderBy(
        `blogs.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    // .where('banInfo.isBanned = false');
    if (query.searchNameTerm) {
      builder.where('blogs.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`,
      });
    }
    const [blogs, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();
    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: blogs,
    };
  }

  async getBlogsForSA(
    dto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const builder = this.blogsTable
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.blogOwnerInfo', 'blogOwnerInfo')
      .leftJoinAndSelect('b.banInfo', 'banInfo')
      .addSelect('blogOwnerInfo.email', 'blogOwnerInfo.email')
      .addSelect('blogOwnerInfo.createdAt', 'blogOwnerInfo.createdAt')
      .addSelect('blogOwnerInfo.passwordHash', 'blogOwnerInfo.passwordHash')
      .addSelect('banInfo.id', 'banInfo.id')
      .addSelect('banInfo.banReason', 'banInfo.banReason')
      .orderBy(
        `b.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .where('banInfo.isBanned = false');

    // if (settings.isAdminRequesting) {
    //   builder.orWhere('banInfo.isBanned = true').leftJoinAndSelect('b.user', 'u');
    // }

    // if (settings.blogsOfSpecifiedUserId) {
    //   builder.where('b.userId = :userId', { userId: settings.blogsOfSpecifiedUserId });
    // }
    if (dto.searchNameTerm) {
      builder.where('b.name ILIKE :name', {
        name: `%${dto.searchNameTerm}%`,
      });
    }

    const [blogs, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    return {
      pagesCount: Math.ceil(total / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: total,
      items: blogs,
    };
  }
}
