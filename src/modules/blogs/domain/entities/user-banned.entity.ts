import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BanInfoEntity } from '../../../auth/domain/entities/ban-info.entity';
import { BlogsEntity } from './blogs.entity';

@Entity('User-banned')
export class UserBannedEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  login: string;
  @Column()
  blogId: string;
  @ManyToOne(() => BanInfoEntity, (b) => b.userBanned, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  banInfo: BanInfoEntity;
  @ManyToOne(() => BlogsEntity, (b) => b.UserBanned, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: BlogsEntity;
}
