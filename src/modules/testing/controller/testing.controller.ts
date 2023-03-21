import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingSqlRepository } from '../repository/testing.sql.repository';

@Controller('testing')
export class TestingController {
  constructor(
    // private testingRepository: TestingRepository
    private testingRepository: TestingSqlRepository,
  ) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAllData() {
    return this.testingRepository.deleteAllData();
  }
}
