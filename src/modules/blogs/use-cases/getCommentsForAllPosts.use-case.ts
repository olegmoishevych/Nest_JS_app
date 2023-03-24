import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class GetCommentsForAllPostsCommand {
  constructor(readonly dto: PaginationDto, readonly user: UserEntity) {}
}
@CommandHandler(GetCommentsForAllPostsCommand)
export class GetCommentsForAllPostsUseCase implements ICommand {
  constructor() {}
  async execute(command: GetCommentsForAllPostsCommand) {}
}
