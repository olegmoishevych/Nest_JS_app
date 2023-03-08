import { Controller } from '@nestjs/common';
import { DevicesService } from '../service/devices.service';

@Controller()
export class DevicesController {
  constructor(public devicesService: DevicesService) {}
}
