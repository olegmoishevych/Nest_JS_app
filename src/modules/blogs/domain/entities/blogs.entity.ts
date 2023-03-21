import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogOwnerInfoEntity } from './blogOwnerInfo.entity';

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
  @OneToOne(() => BlogOwnerInfoEntity, (b) => b.blog, {
    eager: true,
    cascade: true,
    // onDelete: 'CASCADE',
  })
  @JoinColumn()
  blogOwnerInfo: BlogOwnerInfoEntity;
}
