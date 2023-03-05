import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { UserModel } from '../../users/schemas/users.schema';

@Controller('api')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Throttle(5, 10)
  @Post('auth/registration')
  @HttpCode(204)
  async userRegistration(@Body() registrationDto: AuthDto): Promise<UserModel> {
    return this.authService.userRegistration(registrationDto);
  }

  @Throttle(5, 10)
  @Post('auth/registration-confirmation')
  @HttpCode(204)
  async userRegistrationConfirmation(
    @Body('code') code: string,
  ): Promise<UserModel> {
    return this.authService.userRegistrationConfirmation(code);
  }

  @Throttle(5, 10)
  @Post('auth/registration-email-resending')
  @HttpCode(204)
  async userRegistrationEmailResending(
    @Body('email') email: string,
  ): Promise<boolean> {
    return this.authService.userRegistrationEmailResending(email);
  }
}
