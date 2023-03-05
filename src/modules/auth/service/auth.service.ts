import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { UserModel } from '../../users/schemas/users.schema';
import { UsersService } from '../../users/service/users.service';
import { UsersRepository } from '../../users/repository/users.repository';

@Injectable()
export class AuthService {
  constructor(
    public usersService: UsersService,
    public usersRepository: UsersRepository,
  ) {}

  async userRegistration(registrationDto: AuthDto): Promise<UserModel> {
    return this.usersService.createUser(registrationDto);
  }

  async userRegistrationConfirmation(code: string): Promise<UserModel> {
    const findUserByCode = await this.usersRepository.findUserByCode(code);
    if (!findUserByCode)
      throw new NotFoundException([
        {
          message: 'User not found',
          field: 'user',
        },
      ]);
    if (findUserByCode.emailConfirmation.isConfirmed)
      throw new NotFoundException([
        {
          message: 'User already confirmed',
          field: 'user',
        },
      ]);
    return this.usersRepository.updateConfirmationCode(findUserByCode);
  }

  async userRegistrationEmailResending(email: string): Promise<boolean> {
    const findUserByEmail = await this.usersRepository.findUserByEmail(email);
    if (!findUserByEmail || findUserByEmail.emailConfirmation.isConfirmed)
      throw new NotFoundException([
        {
          message: 'Email',
          field: 'email',
        },
      ]);
    return this.usersService.updateUserByEmailResending(email, findUserByEmail);
  }
}
