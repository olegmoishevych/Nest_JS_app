import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './service/comments.service';
import { CommentsViewModal } from './schema/comments.schema';
import { User } from '../auth/decorator/request.decorator';
import { UserModel } from '../users/schemas/users.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsDto } from './dto/comments.dto';
import { LikeStatusDto } from './dto/likeStatus.dto';
import { Token } from '../decorators/token.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { FindCommentByIdCommand } from './use-cases/findCommentById.use-case';
import { UserEntity } from '../auth/domain/entities/user.entity';
import { CreateLikeForCommentCommand } from './use-cases/createLikeForCommentUseCase';
import { LikesEntity } from '../posts/domain/entities/likes.entity';
import { DeleteCommentByIdCommand } from './use-cases/deleteCommentById.use-case';
import { DeleteResult } from 'typeorm';

@Controller('comments')
export class CommentsController {
  constructor(
    public commentsService: CommentsService,
    public command: CommandBus,
  ) {}

  @Get('/:id')
  async findCommentById(
    @Param('id') id: string,
    @Token() userId: string,
  ): Promise<CommentsViewModal> {
    return this.command.execute(new FindCommentByIdCommand(id, userId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:commentId')
  async deleteCommentByCommentId(
    @User() user: UserEntity,
    @Param('commentId') commentId: string,
  ): Promise<DeleteResult> {
    // return this.commentsService.findCommentByIdAndDelete(commentId, user.id);
    return this.command.execute(new DeleteCommentByIdCommand(user, commentId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('/:commentId')
  async updateCommentByCommentId(
    @User() user: UserModel,
    @Param('commentId') commentId: string,
    @Body() content: CommentsDto,
  ): Promise<CommentsViewModal> {
    return this.commentsService.updateCommentByCommentId(
      commentId,
      user.id,
      content.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('/:commentId/like-status')
  async updateLikeStatusByCommentId(
    @Param('commentId') commentId: string,
    @Body() dto: LikeStatusDto,
    @User() user: UserEntity,
  ): Promise<LikesEntity> {
    return this.command.execute(
      new CreateLikeForCommentCommand(commentId, dto, user),
    );
  }
}
