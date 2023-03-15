import { AuthDto } from '../dto/auth.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/use-cases/create-user.use-case';
import { UsersService } from '../../users/service/users.service';
import { EmailService } from '../../email/email.service';

export class RegistrationCommand {
  constructor(readonly registrationDto: AuthDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  private getBodyTextMessage(code: string) {
    return `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href="https://somesite.com/confirm-email?code=${code}">complete registration</a>
      </p>`;
  }

  async execute(command: CreateUserCommand) {
    const { registrationDto } = command;
    const user = await this.usersService.createUser(registrationDto);
    return this.emailService.sentEmail(
      registrationDto.email,
      'confirm code',
      this.getBodyTextMessage(user.emailConfirmation.confirmationCode),
    );
  }
}
