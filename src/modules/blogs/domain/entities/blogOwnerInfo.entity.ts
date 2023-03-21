import { Column, Entity, OneToOne } from 'typeorm';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { BlogsEntity } from './blogs.entity';

// @Entity('BlogOwnerInfo')
// export class BlogOwnerInfoEntity {
//   id: string;
//   @Column()
//   userId: string;
//   @Column()
//   userLogin: string;
//   @OneToOne(() => BlogsEntity, (b) => b.blogOwnerInfo)
//   blog: BlogsEntity;
// }
