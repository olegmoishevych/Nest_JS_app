import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class LoginCommand {
  constructor() {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase {
  constructor() {}
  async execute(command: any) {}
}
