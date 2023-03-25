import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { BanInfo } from '../schemas/users.schema';
import { BanUserDto } from '../dto/userDto';

@Injectable()
export class BanUserByIdCommand {
  constructor(readonly id: string, readonly dto: BanUserDto) {}
}
@CommandHandler(BanUserByIdCommand)
export class BanUserByIdUseCase implements ICommand {
  constructor() {}
  async execute(command: BanUserByIdCommand) {
    // const user = await this.usersRepository.findUserById(id);
    // if (!user) throw new NotFoundException(['User not found']);
    // const updateUser: BanInfo = user.banInfo.isBanned
    //   ? { isBanned: banUserModel.isBanned, banReason: null, banDate: null }
    //   : {
    //     isBanned: banUserModel.isBanned,
    //     banReason: banUserModel.banReason,
    //     banDate: new Date(),
    //   };
    // try {
    //   await this.postsRepository.updateBannedUserById(id, user),
    //     await this.likesRepository.updateBannedUserById(id, user),
    //     await this.deviceRepository.deleteSessionsBanUserById(id),
    //     await this.commentsRepository.updateBannedUserById(id, user);
    //   await this.usersRepository.banUserById(id, updateUser);
    //   return true;
    // } catch (e) {
    //   console.log(e);
    //   return null;
    // }
  }
}
