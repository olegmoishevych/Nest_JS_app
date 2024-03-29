import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import {
  BanInfo,
  EmailConfirmation,
  UserModel,
  UsersModel_For_DB,
} from '../schemas/users.schema';
import { BanUserDto } from '../dto/userDto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { AuthRepository } from '../../auth/repository/auth.repository';
import { EmailService } from '../../email/email.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { CommentsRepository } from '../../comments/repository/comments.repository';
import { LikeStatusRepository } from '../../posts/repository/likeStatus.repository';
import { AuthDto } from '../../auth/dto/auth.dto';
import { UsersSqlRepository } from '../repository/users.sql.repository';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
    private emailService: EmailService,
    private deviceRepository: DevicesRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private likesRepository: LikeStatusRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async createUser(registrationDto: AuthDto): Promise<UsersModel_For_DB> {
    const user = await this.authRepository.findUserByEmail(
      registrationDto.email,
    );
    if (user)
      throw new BadRequestException([
        {
          message: 'User with this email is registered',
          field: 'email',
        },
      ]);
    const findUserByLogin = await this.authRepository.findUserByLogin(
      registrationDto.login,
    );
    if (findUserByLogin)
      throw new BadRequestException([
        {
          message: 'User login is registered yet',
          field: 'login',
        },
      ]);
    const password = registrationDto.password;
    const hash = await bcrypt.hash(password, 10);
    const code = uuidv4();
    const newUser: UsersModel_For_DB = {
      id: uuidv4(),
      login: registrationDto.login,
      email: registrationDto.email,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: code,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: false,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
    await this.usersRepository.createUser({ ...newUser });
    return newUser;
  }

  async updateUserByEmailResending(
    email: string,
    user: UsersModel_For_DB,
  ): Promise<boolean> {
    const code = uuidv4();
    const newEmailConfirmation: EmailConfirmation = {
      confirmationCode: code,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }),
      isConfirmed: false,
    };
    try {
      await this.usersRepository.updateUserConfirmationDate(
        user,
        newEmailConfirmation,
      );
      const message = `https://somesite.com/confirm-email?code=${newEmailConfirmation.confirmationCode}`;
      // await this.emailService.sentEmail(email, 'confirm code', message);
      return;
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const user = await this.usersRepository.findUserById(id);
    if (!user) throw new NotFoundException(`User not found`);
    return this.usersRepository.deleteUserById(id);
  }

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.usersSqlRepository.findUserByloginOrEmail(
      loginOrEmail,
    );
    if (!user) throw new UnauthorizedException();
    const passwordComparison = await bcrypt.compare(
      password,
      user.passwordHash,
    );
    if (!passwordComparison) throw new UnauthorizedException();
    return user;
  }

  async banUserById(id: string, banUserModel: BanUserDto): Promise<boolean> {
    const user = await this.usersRepository.findUserById(id);
    if (!user) throw new NotFoundException(['User not found']);
    const updateUser: BanInfo = user.banInfo.isBanned
      ? { isBanned: banUserModel.isBanned, banReason: null, banDate: null }
      : {
          isBanned: banUserModel.isBanned,
          banReason: banUserModel.banReason,
          banDate: new Date(),
        };
    try {
      await this.postsRepository.updateBannedUserById(id, user),
        await this.likesRepository.updateBannedUserById(id, user),
        await this.deviceRepository.deleteSessionsBanUserById(id),
        await this.commentsRepository.updateBannedUserById(id, user);
      await this.usersRepository.banUserById(id, updateUser);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
