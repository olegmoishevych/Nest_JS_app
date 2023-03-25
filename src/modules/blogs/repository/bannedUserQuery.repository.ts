import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsUserViewModel } from '../schemas/user-banned.schema';
import { CommentsForPostsViewModal } from '../../comments/schema/comments.schema';

@Injectable()
export class BannedUserQueryRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private bannedUserTable: Repository<UserBannedEntity>,
  ) {}

  async getBannedUsersForBlog(blogId: string, dto: BannedUserDto) {
    // : Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    // const user = await this.bannedUserTable
    //   .createQueryBuilder('user-banned')
    //   .leftJoinAndSelect('user-banned.banInfo', 'banInfo')
    //   // .addSelect('blog.isUserBanned', 'isUserBanned')
    //   // .where('blogId = :blogId', { blogId: blogId })
    //   .where('banInfo.isBanned = true')
    //   .orderBy(
    //     `user-banned.${dto.sortBy}`,
    //     dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
    //   );
    // if (dto.searchLoginTerm) {
    //   user.where('user-banned.name ILIKE :name', {
    //     name: `%${dto.searchLoginTerm}%`,
    //   });
    // }
    // const [users, total] = await user
    //   // .select([
    //   //   'comment.id',
    //   //   'comment.content',
    //   //   'commentatorInfo.userId',
    //   //   'commentatorInfo.userLogin',
    //   //   'comment.createdAt',
    //   //   'postInfo.id',
    //   //   'postInfo.title',
    //   //   'postInfo.blogId',
    //   //   'postInfo.blogName',
    //   // ])
    //   .take(dto.pageSize)
    //   .skip((dto.pageNumber - 1) * dto.pageSize)
    //   .getManyAndCount();
    // return new PaginationViewModel<CommentsForPostsViewModal[] | any>(
    //   total,
    //   dto.pageNumber,
    //   dto.pageSize,
    //   users,
    // );
  }
}
