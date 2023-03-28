import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('passwordRecovery')
export class PasswordRecoveryEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  email: string;
  @Column()
  recoveryCode: string;
  @OneToOne(() => UserEntity, (user) => user.passwordRecovery, {
    // onDelete: 'CASCADE',
    // eager: true,
  })
  @JoinColumn()
  user: UserEntity;
}
