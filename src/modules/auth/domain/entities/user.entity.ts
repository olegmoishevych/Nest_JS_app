import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationEntity } from './email.Confirmation.entity';
import { BanInfoEntity } from './ban-info.entity';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

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

  confirmedCode(code: string) {
    if (this.emailConfirmation.isConfirmed) return false;
    if (this.emailConfirmation.confirmationCode !== code) return false;
    if (this.emailConfirmation.expirationDate < new Date()) return false;
    return (this.emailConfirmation.isConfirmed = true);
  }

  // confirmEmail(code: string) {
  //   if (!this.confirmedCode(code)) throw new Error('Cant be confirmed');
  //   this.emailConfirmation.isConfirmed = true;
  // }

  static create(login: string, email: string, passwordHash: string) {
    const banInfo = new BanInfoEntity();
    banInfo.isBanned = false;
    (banInfo.banDate = null), (banInfo.banReason = null);

    const emailConfirmation = new EmailConfirmationEntity();
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
    emailConfirmation.isConfirmed = false;

    const userForDb = new UserEntity();
    userForDb.login = login;
    userForDb.email = email;
    userForDb.passwordHash = passwordHash;
    userForDb.createdAt = new Date().toISOString();
    userForDb.emailConfirmation = emailConfirmation;
    userForDb.banInfo = banInfo;
    return userForDb;
  }
}
