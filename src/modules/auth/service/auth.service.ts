import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { AuthDto } from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UserViewModal } from '../schemas/auth.schemas';
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
    const password = registrationDto.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const code = uuidv4();
    const newUser: UserViewModal = {
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
    };
    // const result = await
  }
}
