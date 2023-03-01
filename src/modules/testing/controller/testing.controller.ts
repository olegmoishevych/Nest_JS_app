import { TestingService } from '../service/testing.service';
import { Controller, Delete } from '@nestjs/common';

@Controller('api')
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Delete('testing/all-data')
  async deleteAllData() {
    return this.testingService.deleteAllData();
  }
}
