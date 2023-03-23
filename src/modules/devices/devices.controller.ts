import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { DevicesService } from './service/devices.service';
import { Cookies } from '../auth/decorator/cookies.decorator';
import { DevicesModal } from './schemas/devices.schemas';
import { DeleteResult } from 'mongodb';

@Controller('security')
export class DevicesController {
  constructor(public devicesService: DevicesService) {}

  @Get('/devices')
  async getAllDevices(@Cookies() cookies): Promise<DevicesModal[]> {
    return this.devicesService.getAllDevices(cookies.refreshToken);
  }

  @Delete('/devices')
  @HttpCode(204)
  async deleteAllDevices(@Cookies() cookies): Promise<DeleteResult> {
    return this.devicesService.deleteAllDevices(cookies.refreshToken);
  }

  @Delete('/devices/:deviceId')
  @HttpCode(204)
  async deleteDevicesByDeviceId(
    @Cookies() cookies,
    @Param('deviceId') deviceId: string,
  ): Promise<boolean> {
    return this.devicesService.deleteAllDevicesByDeviceId(
      cookies.refreshToken,
      deviceId,
    );
  }
}
