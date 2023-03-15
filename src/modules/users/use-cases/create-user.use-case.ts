import { AuthDto } from '../../auth/dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../service/users.service';
import { UserModel } from '../schemas/users.schema';

export class CreateUserCommand {
  constructor(readonly registrationDto: AuthDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler {
  constructor(private usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<UserModel> {
    const { registrationDto } = command;
    const user = await this.usersService.createUser(registrationDto);
    return {
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      id: user.id,
    };
  }
}
