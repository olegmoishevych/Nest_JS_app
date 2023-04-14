import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class PairConnectionCommand {
  constructor() {}
}
@CommandHandler(PairConnectionCommand)
export class PairConnectionUseCase {
  constructor() {}
}
