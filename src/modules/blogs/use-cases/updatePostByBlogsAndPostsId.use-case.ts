import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CreatePostDto } from '../../posts/dto/createPostDto';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { PostsSQLRepository } from '../../posts/repository/postsSQL.repository';

@Injectable()
export class UpdatePostByBlogsAndPostsIdCommand {
  constructor(
    readonly blogId: string,
    readonly postId: string,
    readonly user: UserEntity,
    readonly updatePost: CreatePostDto,
  ) {}
}

@CommandHandler(UpdatePostByBlogsAndPostsIdCommand)
export class UpdatePostByBlogsAndPostsIdUseCase implements ICommandHandler {
  constructor(
    public blogsRepo: BlogsSqlRepository,
    public postsRepo: PostsSQLRepository,
  ) {}
  async execute(command: UpdatePostByBlogsAndPostsIdCommand) {
    const blogs = await this.blogsRepo.findBlogById(command.blogId);
    if (!blogs)
      throw new NotFoundException([
        {
          message: 'BLog with this id not found',
          field: 'blog',
        },
      ]);
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post)
      throw new NotFoundException([
        {
          message: 'Post with this id not found',
          field: 'post',
        },
      ]);
    if (blogs.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([
        { message: 'Its not your blog', field: 'blog' },
      ]);
    post.updatePostByBlogsAndPostsId(command.updatePost);
    return this.postsRepo.save(post);
  }
}
