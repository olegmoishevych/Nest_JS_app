import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { AuthDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(public authRepository: AuthRepository) {}

  async userRegistration(registrationDto: AuthDto) {
    const findUserByLogin = await this.authRepository.findUserByLogin(
      registrationDto.login,
    );
    if (!findUserByLogin)
      throw new NotFoundException([
        {
          message: 'Login not found',
          field: 'login',
        },
      ]);
    const findUserByEmail = await this.authRepository.findUserByEmail(
      registrationDto.email,
    );
    if (!findUserByEmail)
      throw new NotFoundException([
        {
          message: 'Email not found',
          field: 'email',
        },
      ]);
  }
}
