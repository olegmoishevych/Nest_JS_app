import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class CreateQuizQuestionCommand {
  constructor() {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionUseCase implements ICommand {
  constructor() {}

  async execute(command: CreateQuizQuestionCommand) {}
}
