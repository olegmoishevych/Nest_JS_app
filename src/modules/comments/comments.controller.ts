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
    // return this.commentsService.findCommentById(id, userId);
    return this.command.execute(new FindCommentByIdCommand(id, userId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:commentId')
  async deleteCommentByCommentId(
    @User() user: UserModel,
    @Param('commentId') commentId: string,
  ): Promise<CommentsViewModal> {
    return this.commentsService.findCommentByIdAndDelete(commentId, user.id);
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
    @Body() likeStatus: LikeStatusDto,
    @User() user: UserModel,
  ): Promise<CommentsViewModal> {
    return this.commentsService.updateLikeStatusByCommentId(
      commentId,
      likeStatus.likeStatus,
      user,
    );
  }
}
