import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/userDto';

@Controller('api')
export class UsersController {
  constructor(public usersService: UsersService) {}
  @Post('users')
  async createUser(@Body() createdUserType: UserDto) {
    return this.usersService.createUser(createdUserType);
  }
}
