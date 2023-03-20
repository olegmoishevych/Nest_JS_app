import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('BanInfo')
export class BanInfoEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  isBanned: boolean;
  @Column()
  banDate: Date;
  @Column()
  banReason: string;
  @OneToOne(() => UserEntity, (user) => user.banInfo)
  user: UserEntity;
}
