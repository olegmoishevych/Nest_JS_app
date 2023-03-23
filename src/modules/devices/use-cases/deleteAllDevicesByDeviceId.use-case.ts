import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { AuthService } from '../../auth/service/auth.service';
import { DevicesSQLRepository } from '../repository/devicesSQL.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeleteAllDevicesByDeviceIdCommand {
  constructor(readonly refreshToken: string, readonly deviceId: string) {}
}
@CommandHandler(DeleteAllDevicesByDeviceIdCommand)
export class DeleteAllDevicesByDeviceIdUseCase implements ICommand {
  constructor(
    public authService: AuthService,
    public devicesRepo: DevicesSQLRepository,
  ) {}
  async execute(
    command: DeleteAllDevicesByDeviceIdCommand,
  ): Promise<DeleteResult> {
    if (!command.refreshToken) throw new UnauthorizedException([]);
    const user = await this.authService.tokenVerify(command.refreshToken);
    if (!user) throw new UnauthorizedException(['User by token not found']);
    const device = await this.devicesRepo.findDeviceByDeviceId(
      command.deviceId,
    );
    if (!device) throw new NotFoundException(['User not found']);
    if (user.userId !== device.userId)
      throw new ForbiddenException(['Its not your device']);
    return this.devicesRepo.deleteUserSessionByUserAndDeviceId(
      user.userId,
      command.deviceId,
    );
  }
}
