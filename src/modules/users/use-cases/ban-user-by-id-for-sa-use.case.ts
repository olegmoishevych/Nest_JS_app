import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/userDto';
import { UsersSqlRepository } from '../repository/users.sql.repository';
import { DevicesSQLRepository } from '../../devices/repository/devicesSQL.repository';

@Injectable()
export class BanUserByIdForSaCommand {
  constructor(readonly id: string, readonly dto: BanUserDto) {}
}

@CommandHandler(BanUserByIdForSaCommand)
export class BanUserByIdForSaUseCase implements ICommand {
  constructor(
    public usersRepo: UsersSqlRepository,
    public devicesRepo: DevicesSQLRepository,
  ) {}

  async execute(command: BanUserByIdForSaCommand): Promise<boolean> {
    const user = await this.usersRepo.findUserById(command.id);
    if (!user) throw new NotFoundException();
    try {
      user.banUser(command.id, user, command.dto);
      await this.usersRepo.saveResult(user);
      await this.devicesRepo.deleteSessionsBanUserById(command.id);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
