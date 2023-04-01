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
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column()
  deviceId: string;
  @ManyToOne(() => UserEntity, (u) => u.devices, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
}
