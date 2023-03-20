import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('passwordRecovery')
export class PasswordRecoveryEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  email: string;
  @Column()
  recoveryCode: string;
  @OneToOne(() => UserEntity, (user) => user.passwordRecovery)
  user: UserEntity;
}
