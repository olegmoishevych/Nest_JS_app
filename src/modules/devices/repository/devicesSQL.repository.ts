import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesEntity } from '../domain/entities/devices.entity';

@Injectable()
export class DevicesSQLRepository {
  constructor(
    @InjectRepository(DevicesEntity)
    private devicesTable: Repository<DevicesEntity>,
  ) {}
}
