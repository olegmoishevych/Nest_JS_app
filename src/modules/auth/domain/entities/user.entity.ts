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
import { PasswordRecoveryEntity } from './passwordRecoveryEntity';

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
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => PasswordRecoveryEntity, (r) => r.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  passwordRecovery: PasswordRecoveryEntity;
  @OneToOne(() => BanInfoEntity, (b) => b.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  banInfo: BanInfoEntity;

  confirmedCode(code: string) {
    if (this.emailConfirmation.isConfirmed) return false;
    if (this.emailConfirmation.confirmationCode !== code) return false;
    if (this.emailConfirmation.expirationDate < new Date()) return false;
    return (this.emailConfirmation.isConfirmed = true);
  }

  updateConfirmationDate() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }

  createPasswordRecovery() {
    const passwordRecovery = new PasswordRecoveryEntity();
    passwordRecovery.recoveryCode = randomUUID();
    return passwordRecovery;
  }

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
