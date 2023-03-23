import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class UpdatePostByIdCommand {
  constructor() {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase implements ICommand {
  constructor() {}

  async execute(command: any) {}
}
