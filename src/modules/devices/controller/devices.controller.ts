import { Controller, Get } from '@nestjs/common';
import { DevicesService } from '../service/devices.service';
import { Cookies } from '../../auth/decorator/cookies.decorator';
import { DevicesModal } from '../schemas/devices.schemas';

@Controller('api')
export class DevicesController {
  constructor(public devicesService: DevicesService) {}

  @Get('security/devices')
  async getAllDevices(@Cookies() cookies): Promise<DevicesModal> {
    return this.devicesService.getAllDevices(cookies.refreshToken);
  }
}
