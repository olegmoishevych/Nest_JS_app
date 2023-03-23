import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../auth/domain/entities/user.entity';

@Entity('Devices')
export class DevicesEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column()
  deviceId: string;
  @ManyToOne(() => UserEntity, (u) => u.devices, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
}
