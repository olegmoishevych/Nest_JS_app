import {
  Column,
  Entity,
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
  @Column({ collation: 'C' })
  login: string;
  @Column()
  passwordHash: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @OneToOne(() => EmailConfirmationEntity, (e) => e.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true, // // user (owner)
  })
  emailConfirmation: EmailConfirmationEntity;
  @OneToOne(() => PasswordRecoveryEntity, (p) => p.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  passwordRecovery: PasswordRecoveryEntity; // // user (owner)
  @OneToOne(() => BanInfoEntity, (b) => b.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  banInfo: BanInfoEntity; // // user (owner)
  @OneToMany(() => PostsEntity, (p) => p.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  post: PostsEntity; // // user (owner)
  @OneToMany(() => DevicesEntity, (d) => d.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  devices: DevicesEntity; // // user (owner)
  @OneToMany(() => BlogsEntity, (b) => b.blogOwnerInfo, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  blog: BlogsEntity; // // user (owner)
  @OneToMany(() => LikesEntity, (l) => l.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  like: LikesEntity; // // user (owner)
  @OneToMany(() => CommentsEntity, (c) => c.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  comment: CommentsEntity; // user (owner)

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
    if (dto.isBanned) {
      this.banInfo.isBanned = dto.isBanned;
      this.banInfo.banDate = new Date();
      this.banInfo.banReason = dto.banReason;
    } else {
      this.banInfo.isBanned = dto.isBanned;
      this.banInfo.banDate = null;
      this.banInfo.banReason = null;
    }
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
