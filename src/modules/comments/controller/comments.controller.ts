import { Controller, Get, Param } from '@nestjs/common';
import { CommentsService } from '../service/comments.service';
import { CommentsViewModal } from '../schema/comments.schema';

@Controller('api')
export class CommentsController {
  constructor(public commentsService: CommentsService) {}
  @Get('comments/:id')
  async findCommentById(@Param('id') id: string): Promise<CommentsViewModal[]> {
    return this.commentsService.findCommentById(id);
  }
}
