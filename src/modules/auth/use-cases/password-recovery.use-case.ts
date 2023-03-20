import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class PasswordRecoveryCommand {
  constructor() {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase {
  constructor() {}
  async execute(command: PasswordRecoveryCommand) {}
}
