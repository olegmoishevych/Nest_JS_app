import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { BlogsEntity } from '../domain/entities/blogs.entity';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    private blogsTable: Repository<BlogsEntity>,
    private dataSource: DataSource,
  ) {}

  async createBlog(
    id: string,
    login: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogsEntity> {
    const newBlog = BlogsEntity.create(
      id,
      login,
      name,
      description,
      websiteUrl,
    );
    return this.blogsTable.save(newBlog);
  }

  async getBlogsForSA(paginationDto: BlogPaginationDto) {
    const builder = this.blogsTable
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.banInfo', 'banInfo')
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

  async findBlogById(id: string): Promise<BlogsEntity> {
    return this.blogsTable.findOneBy({ id });
  }

  async deleteBlogById(id: string): Promise<DeleteResult> {
    return this.blogsTable.delete(id);
  }
}
