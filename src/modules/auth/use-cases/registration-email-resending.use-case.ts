import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class EmailResendingCommand {
  constructor() {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: EmailResendingCommand) {}
}
