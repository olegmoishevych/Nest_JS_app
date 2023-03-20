import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationEntity } from './email.Confirmation.entity';
import { BanInfoEntity } from './ban-info.entity';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  login: string;
  @Column()
  passwordHash: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @OneToOne(() => EmailConfirmationEntity, (e) => e.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => BanInfoEntity, (b) => b.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  banInfo: BanInfoEntity;
}
