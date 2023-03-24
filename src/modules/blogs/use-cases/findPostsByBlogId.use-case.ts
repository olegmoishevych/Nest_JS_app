import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PaginationDto } from '../../helpers/dto/pagination.dto';

@Injectable()
export class FindPostsByBlogIdCommand {
  constructor(
    readonly blogId: string,
    readonly dto: PaginationDto,
    readonly userId: string,
  ) {}
}
@CommandHandler(FindPostsByBlogIdCommand)
export class FindPostsByBlogIdUseCase implements ICommand {
  constructor() {}
  async execute(command: FindPostsByBlogIdCommand) {}
}
