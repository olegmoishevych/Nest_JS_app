import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class LoginCommand {
  constructor(
    readonly ip: string,
    readonly title: string,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase {
  constructor() {}

  async execute(command: LoginCommand) {
    const { user, title, ip } = command;
    if (user.banInfo.isBanned)
      throw new UnauthorizedException(['User is banned']);
  }
}
