import { Injectable } from '@nestjs/common';

@Injectable()
export class TestingRepository {
  constructor() {} // private dataSource: DataSource,

  async deleteAllData(): Promise<boolean> {
    try {
      await Promise.all([
        // this.userTable
        // this.usersModel.deleteMany(),
        // this.blogsModel.deleteMany(),
        // this.postsModel.deleteMany(),
        // this.commentsModel.deleteMany(),
        // this.recoveryCodeModel.deleteMany(),
        // this.likeStatusModel.deleteMany(),
        // this.devicesModel.deleteMany(),
        // this.userBannedModel.deleteMany(),
      ]);
      return true;
    } catch (e) {
      return false;
    }
  }
}
