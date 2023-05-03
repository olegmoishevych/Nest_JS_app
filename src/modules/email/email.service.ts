import { Injectable } from '@nestjs/common';
import { EmailRepository } from './email.repository';

@Injectable()
export class EmailService {
  constructor(private emailRepository: EmailRepository) {}

  async sendConfirmationCodeByEmail(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    const text = `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href="https://somesite.com/confirm-email?code=${confirmationCode}">complete registration</a>
      </p>`;
    return this.emailRepository.sentEmail(email, 'email confirmation', text);
  }

  async sendPasswordRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const text = `https://somesite.com/password-recovery?recoveryCode=${recoveryCode}`;
    return this.emailRepository.sentEmail(email, 'Recovery code', text);
  }
}
