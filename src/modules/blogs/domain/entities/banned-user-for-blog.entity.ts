import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from './blogs.entity';
import { BanUserForBloggerDto } from '../../dto/bloggerDto';
import { UserEntity } from '../../../auth/domain/entities/user.entity';

@Entity('Banned')
export class BannedUserForBlogEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column({ nullable: true })
  userId: string;
  @Column({ nullable: true })
  banReason: string;
  @Column({ nullable: true })
  isBanned: boolean;
  @Column()
  login: string;
  @Column({ nullable: true })
  createdAt: Date;
  @Column()
  blogId: string;
  @ManyToMany(() => BlogsEntity, (b) => b.userBanned, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: BlogsEntity;

  bannedUser(banUserModal: BanUserForBloggerDto, user: UserEntity): void {
    this.userId = user.id;
    this.login = user.login;
    this.blogId = banUserModal.blogId;
    this.createdAt = new Date();
    this.banReason = banUserModal.banReason;
    this.isBanned = banUserModal.isBanned;
  }
}
