import { AuthDto } from '../dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/use-cases/create-user.use-case';
import { UsersService } from '../../users/service/users.service';
import { EmailService } from '../../email/email.service';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class RegistrationCommand {
  constructor(readonly registrationDto: AuthDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private usersRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<boolean> {
    const { email, login, password } = command.dto;
    const userByEmail = await this.usersRepository.findUserByEmail(email);
    if (userByEmail)
      throw new BadRequestException([
        {
          message: 'User with this email is registered',
          field: 'email',
        },
      ]);
    const userByLogin = await this.usersRepository.findUserByLogin(login);
    if (userByLogin)
      throw new BadRequestException([
        {
          message: 'User login is registered yet',
          field: 'login',
        },
      ]);
    const passwordHash = await bcrypt.hash(password, 5);
    const user = await this.usersRepository.createUser(
      login,
      email,
      passwordHash,
    );
    try {
      await this.emailService.sendConfirmationCodeByEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
      );
      return true;
    } catch (e) {
      console.log(e);
      await this.usersRepository.deleteUserById(user.id);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
