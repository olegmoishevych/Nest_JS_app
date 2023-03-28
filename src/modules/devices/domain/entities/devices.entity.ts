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
  @ManyToOne(() => UserEntity, (u) => u.devices)
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
  updateUserSessionById(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
    userId: string,
  ) {
    (this.ip = ip),
      (this.title = title),
      (this.lastActiveDate = lastActiveDate),
      (this.deviceId = deviceId),
      (this.userId = userId);
  }
  static createUserSession(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
    userId: string,
  ) {
    const userSessionForDb = new DevicesEntity();
    (userSessionForDb.ip = ip),
      (userSessionForDb.title = title),
      (userSessionForDb.lastActiveDate = lastActiveDate),
      (userSessionForDb.deviceId = deviceId),
      (userSessionForDb.userId = userId);
    return userSessionForDb;
  }
}
