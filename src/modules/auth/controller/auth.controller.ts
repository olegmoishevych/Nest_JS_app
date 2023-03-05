import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { UsersViewModel } from '../../users/schemas/users.schema';

@Controller('api')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Throttle(5, 10)
  @Post('auth/registration')
  @HttpCode(204)
  async userRegistration(
    @Body() registrationDto: AuthDto,
  ): Promise<UsersViewModel> {
    return this.authService.userRegistration(registrationDto);
  }

  @Throttle(5, 10)
  @Post('auth/registration-confirmation')
  @HttpCode(204)
  async userRegistrationConfirmation(@Body('code') code: string) {
    return this.authService.userRegistrationConfirmation(code);
  }
}
