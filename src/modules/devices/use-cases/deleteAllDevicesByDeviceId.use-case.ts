import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class DeleteAllDevicesByDeviceIdCommand {
  constructor(readonly refreshToken: string, readonly deviceId: string) {}
}
@CommandHandler(DeleteAllDevicesByDeviceIdCommand)
export class DeleteAllDevicesByDeviceIdUseCase implements ICommand {
  constructor() {}
  async execute(command: DeleteAllDevicesByDeviceIdCommand) {}
}
