import { AuthDto } from '../dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/use-cases/create-user.use-case';
import { UsersService } from '../../users/service/users.service';
import { EmailService } from '../../email/email.service';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class RegistrationCommand {
  constructor(readonly dto: AuthDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private usersRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<boolean> {
    const userByEmail = await this.usersRepository.findUserByEmail(
      command.dto.email,
    );
    console.log('userByEmail', userByEmail);
    if (userByEmail)
      throw new BadRequestException([
        {
          message: 'User with this email is registered',
          field: 'email',
        },
      ]);
    const userByLogin = await this.usersRepository.findUserByLogin(
      command.dto.login,
    );
    if (userByLogin)
      throw new BadRequestException([
        {
          message: 'User login is registered yet',
          field: 'login',
        },
      ]);
    const passwordHash = await bcrypt.hash(command.dto.password, 5);
    const user = await this.usersRepository.createUser(
      command.dto.login,
      command.dto.email,
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
      return null;
    }
  }
}
