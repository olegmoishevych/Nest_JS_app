import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

@Injectable()
export class EmailRepository {
  constructor(private readonly mailerService: MailerService) {}

  async sentEmail(
    email: string,
    subject: string,
    text: string,
  ): Promise<boolean> {
    return this.mailerService.sendMail({
      from: 'Oleg <olegmoishevych@gmail.com>',
      to: email,
      subject,
      text,
    });
  }
}
