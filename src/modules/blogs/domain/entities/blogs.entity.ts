import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BanInfoEntity } from '../../../auth/domain/entities/ban-info.entity';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { BlogsDto } from '../../dto/blogsDto';
import { PostsEntity } from '../../../posts/domain/entities/posts.entity';
import { BannedUserForBlogEntity } from './banned-user-for-blog.entity';
import { BanBlogUserDto } from '../../../users/dto/userDto';

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
  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    eager: true,
    cascade: true,
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
  @OneToMany(() => PostsEntity, (p) => p.blog)
  post: PostsEntity;
  @OneToMany(() => BannedUserForBlogEntity, (u) => u.blog, {})
  userBanned: BannedUserForBlogEntity;

  updateBlog(dto: BlogsDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  banBlogById(blog: BlogsEntity, dto: BanBlogUserDto): void {
    this.banInfo.isBlogBanned = dto.isBanned;
    this.banInfo.userId = blog.blogOwnerInfo.id;
    this.banInfo.banDate = new Date();
  }

  static create(
    user: UserEntity,
    id: string,
    login: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): BlogsEntity {
    const banInfo = new BanInfoEntity();
    banInfo.isBanned = false;
    banInfo.banDate = null;
    banInfo.isBlogBanned = false;

    const blogForDb = new BlogsEntity();
    blogForDb.name = name;
    blogForDb.description = description;
    blogForDb.websiteUrl = websiteUrl;
    blogForDb.createdAt = new Date().toISOString();
    blogForDb.isMembership = false;
    blogForDb.blogOwnerInfo = user;
    blogForDb.banInfo = banInfo;
    return blogForDb;
  }
}
