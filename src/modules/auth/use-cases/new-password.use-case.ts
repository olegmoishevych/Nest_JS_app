import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class NewPasswordCommand {
  constructor() {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase {
  constructor() {}
  async execute(command: NewPasswordCommand) {}
}
