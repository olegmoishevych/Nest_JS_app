import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';

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
  banDate: Date;
  @Column({ nullable: true })
  banReason: string | null;
  @OneToOne(() => UserEntity, (user) => user.banInfo, { onDelete: 'CASCADE' })
  user: UserEntity;
  @OneToOne(() => BlogsEntity, (b) => b.banInfo, { onDelete: 'CASCADE' })
  blog: BlogsEntity;
  // @OneToMany(() => UserBannedEntity, (u) => u.banInfo, { onDelete: 'CASCADE' })
  // userBanned: UserBannedEntity;
}
