import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { BadRequestException } from '@nestjs/common';
import { EmailService } from '../../email/email.service';

export class EmailResendingCommand {
  constructor(readonly email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler {
  constructor(
    private emailService: EmailService,
    private usersRepository: UsersSqlRepository,
  ) {}

  async execute(command: EmailResendingCommand) {
    const userByEmail = await this.usersRepository.findUserByEmail(
      command.email,
    );
    if (!userByEmail || userByEmail.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'Email',
          field: 'email',
        },
      ]);
    userByEmail.updateConfirmationDate();
    try {
      await this.usersRepository.saveResult(userByEmail);
      await this.emailService.sendConfirmationCodeByEmail(
        command.email,
        userByEmail.emailConfirmation.confirmationCode,
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
