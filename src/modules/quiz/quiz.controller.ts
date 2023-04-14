import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorator/request.decorator';
import { UserEntity } from '../auth/domain/entities/user.entity';

@Controller('pair-game-quiz')
export class QuizController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Post('pair/connection')
  async pairConnection(@User() user: UserEntity) {}
}
