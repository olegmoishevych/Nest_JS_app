import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';
import { UserBannedEntity } from '../../../blogs/domain/entities/user-banned.entity';
import { PostsEntity } from '../../../posts/domain/entities/posts.entity';

@Entity('BanInfo')
export class BanInfoEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column({ nullable: true })
  isBlogBanned: boolean;
  @Column({ nullable: true })
  userId: string;
  @Column({ default: false })
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: string | null;
  @Column({ nullable: true })
  banReason: string | null;
  @OneToOne(() => UserEntity, (user) => user.banInfo, { onDelete: 'CASCADE' })
  user: UserEntity;
  @OneToOne(() => BlogsEntity, (b) => b.banInfo, { onDelete: 'CASCADE' })
  blog: BlogsEntity;
  @OneToMany(() => UserBannedEntity, (u) => u.banInfo, { onDelete: 'CASCADE' })
  userBanned: UserBannedEntity;
}
