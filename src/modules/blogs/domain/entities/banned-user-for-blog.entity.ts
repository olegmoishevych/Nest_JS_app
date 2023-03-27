import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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
  @ManyToOne(() => BlogsEntity, (b) => b.userBanned, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: BlogsEntity;
  createBannedUser(
    blog: BannedUserForBlogEntity,
    dto: BanUserForBloggerDto,
    user: UserEntity,
  ) {
    const bannedUser = new BannedUserForBlogEntity();
    bannedUser.userId = user.id;
    bannedUser.banReason = dto.banReason;
    bannedUser.isBanned = dto.isBanned;
    // bannedUser.blogId = blog.id;
    bannedUser.login = user.login;
    bannedUser.createdAt = new Date();
    // bannedUser.blog = blog;
    return bannedUser;
  }
  bannedUser(banUserModal: BanUserForBloggerDto, user: UserEntity): void {
    this.userId = user.id;
    this.login = user.login;
    this.blogId = banUserModal.blogId;
    this.createdAt = new Date();
    this.banReason = banUserModal.banReason;
    this.isBanned = banUserModal.isBanned;
  }
}
