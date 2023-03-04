import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';

@Controller('api')
export class AuthController {
  constructor(public authService: AuthService) {}
  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() registrationDto: AuthDto) {
    return this.authService.userRegistration(registrationDto);
  }
}
