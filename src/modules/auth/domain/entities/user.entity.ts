import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationEntity } from './email.Confirmation.entity';
import { BanInfoEntity } from './ban-info.entity';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { PasswordRecoveryEntity } from './passwordRecoveryEntity';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';
import { PostsEntity } from '../../../posts/domain/entities/posts.entity';
import { DevicesEntity } from '../../../devices/domain/entities/devices.entity';
import { BanUserDto } from '../../../users/dto/userDto';

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
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => PasswordRecoveryEntity, (p) => p.user, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  passwordRecovery: PasswordRecoveryEntity;
  @OneToOne(() => BanInfoEntity, (b) => b.user, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  banInfo: BanInfoEntity;
  @OneToMany(() => BlogsEntity, (b) => b.blogOwnerInfo, {
    // eager: true,
    // cascade: true,
    onDelete: 'CASCADE',
  })
  // @JoinColumn()
  blog: BlogsEntity;
  @OneToMany(() => PostsEntity, (p) => p.user, {
    // eager: true,
    // cascade: true,
    onDelete: 'CASCADE',
  })
  post: PostsEntity;
  @OneToMany(() => DevicesEntity, (d) => d.user, {
    // eager: true,
    // cascade: true,
    onDelete: 'CASCADE',
  })
  devices: DevicesEntity;

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

  createPasswordRecovery(email: string) {
    const passwordRecovery = new PasswordRecoveryEntity();
    passwordRecovery.email = email;
    passwordRecovery.recoveryCode = randomUUID();
    this.passwordRecovery = passwordRecovery;
    return passwordRecovery.recoveryCode;
  }

  updateUserHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }
  banUser(userId: string, user: UserEntity, dto: BanUserDto) {
    this.banInfo.isBanned = dto.isBanned;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = dto.banReason;
    this.banInfo.userId = userId;
  }
  static create(login: string, email: string, passwordHash: string) {
    const banInfo = new BanInfoEntity();
    banInfo.isBanned = false;
    (banInfo.banDate = null), (banInfo.banReason = null);
    banInfo.userId = null;

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
