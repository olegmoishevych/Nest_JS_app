import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../repository/users.sql.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeleteUserCommand {
  constructor(readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private usersRepository: UsersSqlRepository) {}
  async execute(command: DeleteUserCommand): Promise<DeleteResult> {
    const user = await this.usersRepository.findUserById(command.id);
    if (!user) throw new NotFoundException(`User not found`);
    return this.usersRepository.deleteUserById(command.id);
  }
}
