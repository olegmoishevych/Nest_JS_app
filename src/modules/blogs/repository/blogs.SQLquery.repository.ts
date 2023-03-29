import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogsEntity } from '../domain/entities/blogs.entity';
import { Repository } from 'typeorm';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';
import { UserEntity } from '../../auth/domain/entities/user.entity';

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
      .leftJoinAndSelect('blogs.banInfo', 'banInfo')
      .where('banInfo.isBanned = false')
      .andWhere('banInfo.isBlogBanned = false')
      .orderBy(
        `blogs.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    if (query.searchNameTerm) {
      builder.where('blogs.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`,
      });
    }
    const [blogs, total] = await builder
      .select([
        'blogs.id',
        'blogs.name',
        'blogs.description',
        'blogs.websiteUrl',
        'blogs.createdAt',
        'blogs.isMembership',
      ])
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
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
        'blogOwnerInfo.id',
        'blogOwnerInfo.login',
        'banInfo.isBlogBanned',
        'banInfo.banDate',
      ])
      .orderBy(
        `b.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    if (dto.searchNameTerm) {
      builder.where('b.name ILIKE :name', {
        name: `%${dto.searchNameTerm}%`,
      });
    }
    const [blogs, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();

    const transformedResults = blogs.map((b) => {
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.blogOwnerInfo.id,
          userLogin: b.blogOwnerInfo.login,
        },
        banInfo: {
          isBanned: b.banInfo.isBlogBanned,
          banDate: b.banInfo.banDate,
        },
      };
    });

    return {
      pagesCount: Math.ceil(total / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: total,
      items: transformedResults,
    };
  }

  async getBlogsForOwner(
    dto: BlogPaginationDto,
    user: UserEntity,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const builder = this.blogsTable
      .createQueryBuilder('blogs')
      .leftJoinAndSelect('blogs.blogOwnerInfo', 'blogOwnerInfo')
      .leftJoinAndSelect('blogs.banInfo', 'banInfo')
      .where('banInfo.isBanned = false')
      .andWhere('blogOwnerInfo.id = :id', { id: user.id })
      .orderBy(
        `blogs.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    if (dto.searchNameTerm) {
      builder.where('blogs.name ILIKE :name', {
        name: `%${dto.searchNameTerm}%`,
      });
    }

    const [blogs, total] = await builder
      .select([
        'blogs.id',
        'blogs.name',
        'blogs.description',
        'blogs.websiteUrl',
        'blogs.createdAt',
        'blogs.isMembership',
      ])
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
