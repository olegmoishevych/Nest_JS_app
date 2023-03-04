import { Controller, Post } from '@nestjs/common';

@Controller('api')
export class AuthController {
  constructor() {}
  @Post('registration')
  async userRegistration() {}
}
