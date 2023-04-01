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
  // static createUserSession(
  //   ip: string,
  //   title: string,
  //   lastActiveDate: Date,
  //   deviceId: string,
  //   userId: string,
  // ) {
  //   const userSessionForDb = new DevicesEntity();
  //   userSessionForDb.ip = ip;
  //   userSessionForDb.title = title;
  //   userSessionForDb.lastActiveDate = lastActiveDate;
  //   userSessionForDb.deviceId = deviceId;
  //   userSessionForDb.userId = userId;
  //   return userSessionForDb;
  // }
}
