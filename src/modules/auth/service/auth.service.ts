import { Injectable } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { UsersViewModel } from '../../users/schemas/users.schema';
import { UsersService } from '../../users/service/users.service';

@Injectable()
export class AuthService {
  constructor(public usersService: UsersService) {}

  async userRegistration(registrationDto: AuthDto): Promise<UsersViewModel> {
    return this.usersService.createUser(registrationDto);
  }

  async userRegistrationConfirmation(code: string) {}
}
