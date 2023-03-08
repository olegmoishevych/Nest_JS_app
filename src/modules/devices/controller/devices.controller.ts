import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { DevicesService } from '../service/devices.service';
import { Cookies } from '../../auth/decorator/cookies.decorator';
import { DevicesModal } from '../schemas/devices.schemas';
import { DeleteResult } from 'mongodb';

@Controller('api')
export class DevicesController {
  constructor(public devicesService: DevicesService) {}

  @Get('security/devices')
  async getAllDevices(@Cookies() cookies): Promise<DevicesModal[]> {
    return this.devicesService.getAllDevices(cookies.refreshToken);
  }

  @Delete('security/devices')
  @HttpCode(204)
  async deleteAllDevices(@Cookies() cookies): Promise<DeleteResult> {
    return this.devicesService.deleteAllDevices(cookies.refreshToken);
  }

  @Delete('security/devices/:deviceId')
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
