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
    paginationDto: BlogPaginationDto,
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
        `b.${paginationDto.sortBy}`,
        paginationDto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .where('banInfo.isBanned = false');

    // if (settings.isAdminRequesting) {
    //   builder.orWhere('banInfo.isBanned = true').leftJoinAndSelect('b.user', 'u');
    // }

    // if (settings.blogsOfSpecifiedUserId) {
    //   builder.where('b.userId = :userId', { userId: settings.blogsOfSpecifiedUserId });
    // }
    if (paginationDto.searchNameTerm) {
      builder.where('b.name ILIKE :name', {
        name: `%${paginationDto.searchNameTerm}%`,
      });
    }

    const [blogs, total] = await builder
      .take(paginationDto.pageSize)
      .skip((paginationDto.pageNumber - 1) * paginationDto.pageSize)
      .getManyAndCount();
    return {
      pagesCount: Math.ceil(total / paginationDto.pageSize),
      page: paginationDto.pageNumber,
      pageSize: paginationDto.pageSize,
      totalCount: total,
      items: blogs,
    };
  }
}
