import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable()
export class GetAlldevicesCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(GetAlldevicesCommand)
export class GetAlldevicesUseCase implements ICommand {
  constructor(public authService: AuthService) {}

  async execute(command: GetAlldevicesCommand) {
    if (!command.refreshToken) throw new UnauthorizedException([]);
    const user = await this.authService.tokenVerify(command.refreshToken);
    if (!user) throw new UnauthorizedException([]);
    const userId = user.userId;
  }
}
