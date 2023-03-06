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
import { CommentsService } from '../service/comments.service';
import { CommentsViewModal } from '../schema/comments.schema';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorator/request.decorator';
import { UserModel } from '../../users/schemas/users.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsDto } from '../dto/comments.dto';

@Controller('api')
export class CommentsController {
  constructor(public commentsService: CommentsService) {}

  @Get('comments/:id')
  async findCommentById(@Param('id') id: string): Promise<CommentsViewModal> {
    return this.commentsService.findCommentById(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('comments/:commentId')
  async deleteCommentByCommentId(
    @User() user: UserModel,
    @Param('commentId') commentId: string,
  ): Promise<CommentsViewModal> {
    return this.commentsService.findCommentByIdAndDelete(commentId, user.id);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('comments/:commentId')
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
}
