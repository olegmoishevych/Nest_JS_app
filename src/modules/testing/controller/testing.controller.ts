import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingRepository } from '../repository/testing.repository';

@Controller('testing')
export class TestingController {
  constructor(private testingRepository: TestingRepository) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAllData() {
    return this.testingRepository.deleteAllData();
  }
}
