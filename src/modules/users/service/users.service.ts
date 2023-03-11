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
import { BanUserDto, UserDto } from '../dto/userDto';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { AuthRepository } from '../../auth/repository/auth.repository';
import { EmailService } from '../../email/email.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { CommentsRepository } from '../../comments/repository/comments.repository';
import { LikeStatusRepository } from '../../posts/repository/likeStatus.repository';

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
  ) {}

  async findAllUsers(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersRepository.findAllUsers(paginationDto);
  }

  async createUser(user: UserDto): Promise<UserModel> {
    const findUser = await this.authRepository.findUserByLogin(user.login);
    if (findUser) throw new BadRequestException([]);
    const findUserByEmail = await this.authRepository.findUserByEmail(
      user.email,
    );
    if (findUserByEmail) throw new BadRequestException([]);
    const password = user.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const code = uuidv4();
    const newUser: UsersModel_For_DB = {
      id: uuidv4(),
      login: user.login,
      email: user.email,
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
    const result = await this.usersRepository.createUser({ ...newUser });
    const bodyTextMessage = `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href="https://somesite.com/confirm-email?code=${newUser.emailConfirmation.confirmationCode}">complete registration</a>
      </p>`;
    await this.emailService.sentEmail(
      user.email,
      'confirm code',
      bodyTextMessage,
    );
    return result;
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
      await this.emailService.sentEmail(email, 'confirm code', message);
      return;
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const findUserById = await this.usersRepository.findUserById(id);
    if (!findUserById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return this.usersRepository.deleteUserById(id);
  }

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserModel> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
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
