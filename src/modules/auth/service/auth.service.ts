import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { AuthDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(public authRepository: AuthRepository) {}
  async userRegistration(registrationDto: AuthDto) {}
}
