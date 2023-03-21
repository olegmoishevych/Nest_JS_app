import { AuthDto } from '../../auth/dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserModel } from '../schemas/users.schema';
import { UsersSqlRepository } from '../repository/users.sql.repository';
import * as bcrypt from 'bcrypt';

export class CreateUserCommand {
  constructor(readonly registrationDto: AuthDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: CreateUserCommand): Promise<UserModel> {
    const { registrationDto } = command;
    const passwordHash = await bcrypt.hash(registrationDto.password, 5);
    const user = await this.usersRepository.createUser(
      registrationDto.login,
      registrationDto.email,
      passwordHash,
    );
    return {
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      id: user.id,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
}
