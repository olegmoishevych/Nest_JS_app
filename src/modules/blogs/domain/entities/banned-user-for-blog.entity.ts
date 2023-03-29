import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from './blogs.entity';
import { BanUserForBloggerDto } from '../../dto/bloggerDto';
import { UserEntity } from '../../../auth/domain/entities/user.entity';

@Entity('Banned')
export class BannedUserForBlogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: string;
  @Column()
  banReason: string;
  @Column({ default: false })
  isBanned: boolean;
  @Column()
  login: string;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  blogId: string;
  @OneToMany(() => BlogsEntity, (b) => b.userBanned)
  @JoinColumn()
  blog: BlogsEntity;

  // bannedUser(dto: BanUserForBloggerDto): void {
  //   if (dto.isBanned) {
  //     this.banReason = dto.banReason;
  //     this.isBanned = dto.isBanned;
  //     this.blogId = dto.blogId;
  //     this.createdAt = new Date();
  //   } else {
  //     this.banReason = null;
  //     this.isBanned = dto.isBanned;
  //     this.blogId = dto.blogId;
  //     this.createdAt = null;
  //   }
  // }
}
