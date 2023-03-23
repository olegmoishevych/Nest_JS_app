import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { LikeStatusDto } from '../dto/createPostDto';
import { LikesEntity } from '../domain/entities/likes.entity';

@Injectable()
export class LikeStatusSQLRepository {
  constructor(
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
  ) {}

  async createLikeStatusByPostId(
    postId: string,
    user: UserEntity,
    dto: LikeStatusDto,
  ): Promise<LikesEntity> {
    const likeForPost = LikesEntity.createLikeForPost(postId, user, dto);
    return this.likesTable.save(likeForPost);
  }
}
