import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from './blogs.entity';

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
  @Column({ collation: 'C' })
  login: string;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  blogId: string;
  @OneToMany(() => BlogsEntity, (b) => b.userBanned)
  @JoinColumn()
  blog: BlogsEntity;
}
