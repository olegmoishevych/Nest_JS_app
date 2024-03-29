import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { Cookies } from '../auth/decorator/cookies.decorator';
import { DevicesEntity } from './domain/entities/devices.entity';
import { CommandBus } from '@nestjs/cqrs';
import { GetAlldevicesCommand } from './use-cases/getAlldevices.use-case';
import { DeleteResult } from 'typeorm';
import { DeleteAlldevicesCommand } from './use-cases/deleteAlldevies.use-case';
import { DeleteAllDevicesByDeviceIdCommand } from './use-cases/deleteAllDevicesByDeviceId.use-case';

@Controller('security')
export class DevicesController {
  constructor(public command: CommandBus) {}

  @Get('/devices')
  async getAllDevices(@Cookies() cookies): Promise<DevicesEntity[]> {
    return this.command.execute(new GetAlldevicesCommand(cookies.refreshToken));
  }

  @Delete('/devices')
  @HttpCode(204)
  async deleteAllDevices(@Cookies() cookies): Promise<DeleteResult> {
    return this.command.execute(
      new DeleteAlldevicesCommand(cookies.refreshToken),
    );
  }

  @Delete('/devices/:deviceId')
  @HttpCode(204)
  async deleteDevicesByDeviceId(
    @Cookies() cookies,
    @Param('deviceId') deviceId: string,
  ): Promise<DeleteResult> {
    return this.command.execute(
      new DeleteAllDevicesByDeviceIdCommand(cookies.refreshToken, deviceId),
    );
  }
}
