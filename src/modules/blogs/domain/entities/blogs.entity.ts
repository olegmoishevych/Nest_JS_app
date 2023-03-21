import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BanInfoEntity } from '../../../auth/domain/entities/ban-info.entity';
import { UserEntity } from '../../../auth/domain/entities/user.entity';

@Entity('Blogs')
export class BlogsEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: string;
  @Column()
  isMembership: boolean;
  @OneToOne(() => UserEntity, (u) => u.blog, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blogOwnerInfo: UserEntity;
  @OneToOne(() => BanInfoEntity, (b) => b.blog, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  banInfo: BanInfoEntity;

  static create(
    id: string,
    login: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): BlogsEntity {
    const blogOwnerInfo = new UserEntity();
    blogOwnerInfo.id = id;
    blogOwnerInfo.login = login;

    const banInfo = new BanInfoEntity();
    banInfo.isBanned = false;
    banInfo.banDate = null;

    const blogForDb = new BlogsEntity();
    blogForDb.name = name;
    blogForDb.description = description;
    blogForDb.websiteUrl = websiteUrl;
    blogForDb.createdAt = new Date().toISOString();
    blogForDb.isMembership = false;
    return blogForDb;
  }
}
