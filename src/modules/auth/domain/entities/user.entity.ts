import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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
import { LikesEntity } from '../../../posts/domain/entities/likes.entity';
import { CommentsEntity } from '../../../comments/domain/comments.entity';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
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
  @OneToMany(() => PostsEntity, (p) => p.user, {
    onDelete: 'CASCADE',
  })
  post: PostsEntity;
  @OneToMany(() => DevicesEntity, (d) => d.user, {
    onDelete: 'CASCADE',
  })
  devices: DevicesEntity;
  @OneToMany(() => BlogsEntity, (b) => b.blogOwnerInfo)
  blog: BlogsEntity;
  @OneToMany(() => LikesEntity, (l) => l.user, {
    onDelete: 'CASCADE',
  })
  like: LikesEntity;
  @OneToMany(() => CommentsEntity, (c) => c.user)
  comment: CommentsEntity;

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
  banUser(userId: string, user: UserEntity, dto: BanUserDto): void {
    this.banInfo.isBanned = dto.isBanned;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = dto.banReason;
    this.banInfo.userId = userId;
  }
  static create(
    login: string,
    email: string,
    passwordHash: string,
  ): UserEntity {
    const banInfo = new BanInfoEntity();
    banInfo.isBanned = false;
    banInfo.banDate = null;
    banInfo.banReason = null;

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
