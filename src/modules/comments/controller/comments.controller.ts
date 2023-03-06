import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { CommentsService } from '../service/comments.service';
import { CommentsViewModal } from '../schema/comments.schema';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorator/request.decorator';
import { UserModel } from '../../users/schemas/users.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api')
export class CommentsController {
  constructor(public commentsService: CommentsService) {}

  @Get('comments/:id')
  async findCommentById(@Param('id') id: string): Promise<CommentsViewModal> {
    return this.commentsService.findCommentById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteCommentByCommentId(
    @User() user: UserModel,
    @Param('commentId') commentId: string,
  ): Promise<CommentsViewModal> {
    return this.commentsService.findCommentByIdAndDelete(commentId, user.id);
  }
}
