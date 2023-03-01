import { TestingRepository } from '../repository/testing.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestingService {
  constructor(private testingRepository: TestingRepository) {}
  async deleteAllData() {
    return this.testingRepository.deleteAllData();
  }
}
