import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import {
  UsersModel_For_DB,
  UserModel,
  EmailConfirmation,
} from '../schemas/users.schema';
import { UserDto } from '../dto/userDto';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { AuthRepository } from '../../auth/repository/auth.repository';
import { EmailService } from '../../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private authRepository: AuthRepository,
    private emailService: EmailService,
  ) {}

  async findAllUsers(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersRepository.findAllUsers(paginationDto);
  }

  async createUser(user: UserDto): Promise<UserModel> {
    const findUserByLogin = await this.authRepository.findUserByLogin(
      user.login,
    );
    if (findUserByLogin)
      throw new NotFoundException([
        {
          message: 'Login not found',
          field: 'login',
        },
      ]);
    const findUserByEmail = await this.authRepository.findUserByEmail(
      user.email,
    );
    if (findUserByEmail)
      throw new NotFoundException([
        {
          message: 'Email not found',
          field: 'email',
        },
      ]);
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
}
