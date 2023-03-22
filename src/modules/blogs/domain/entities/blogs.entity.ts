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
import { BanUserForBloggerDto } from '../../dto/bloggerDto';
import { UserBannedEntity } from './user-banned.entity';

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
  @ManyToOne(() => UserEntity, (u) => u.blog, {
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
  @OneToMany(() => PostsEntity, (p) => p.blog, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  post: PostsEntity;
  @OneToMany(() => UserBannedEntity, (u) => u.blog, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  UserBanned: UserBannedEntity;

  // ban(blogId: string, banUserModal: BanUserForBloggerDto) {
  //   // this.id = blogId
  //   this.banInfo.isBanned = banUserModal.isBanned;
  //   this.banInfo.banDate = new Date().toISOString();
  //   this.banInfo.banReason = banUserModal.banReason;
  // }
  updateBlog(updateBlogType: BlogsDto) {
    const updatedBlog = (this.name = updateBlogType.name);
    (this.description = updateBlogType.description),
      (this.websiteUrl = updateBlogType.websiteUrl);
    return updatedBlog;
  }

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
    blogForDb.blogOwnerInfo = blogOwnerInfo;
    blogForDb.banInfo = banInfo;
    return blogForDb;
  }
}
