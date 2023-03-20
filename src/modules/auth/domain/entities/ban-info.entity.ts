import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('BanInfo')
export class BanInfoEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: string | null;
  @Column({ nullable: true })
  banReason: string | null;
  @OneToOne(() => UserEntity, (user) => user.banInfo)
  user: UserEntity;
}
