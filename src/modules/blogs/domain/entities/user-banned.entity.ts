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
export class UserBannedEntity {
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
  // @ManyToOne(() => BanInfoEntity, (b) => b.userBanned, {
  //   eager: true,
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn()
  // banInfo: BanInfoEntity;
  @ManyToOne(() => BlogsEntity, (b) => b.userBanned, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: BlogsEntity;
  bannedUser(banUserModal: BanUserForBloggerDto, user: UserEntity) {
    this.userId = user.id;
    this.login = user.login;
    this.blogId = banUserModal.blogId;
    this.createdAt = new Date();
    this.banReason = banUserModal.banReason;
    this.isBanned = banUserModal.isBanned;
  }
}
