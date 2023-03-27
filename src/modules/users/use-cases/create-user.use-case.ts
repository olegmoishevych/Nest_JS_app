import { AuthDto } from '../../auth/dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserModel } from '../schemas/users.schema';
import { UsersSqlRepository } from '../repository/users.sql.repository';
import * as bcrypt from 'bcrypt';

export class CreateUserCommand {
  constructor(readonly dto: AuthDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: CreateUserCommand): Promise<UserModel> {
    const passwordHash = await bcrypt.hash(command.dto.password, 5);
    const user = await this.usersRepository.createUser(
      command.dto.login,
      command.dto.email,
      passwordHash,
    );
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
}
