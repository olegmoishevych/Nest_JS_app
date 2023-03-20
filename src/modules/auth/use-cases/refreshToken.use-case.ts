import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class RefreshTokenCommand {
  constructor() {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase {
  constructor() {}
  async execute(command: RefreshTokenCommand) {}
}
