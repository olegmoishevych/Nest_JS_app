import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../posts/dto/createPostDto';
import { PostsSQLRepository } from '../../posts/repository/postsSQL.repository';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PostsEntity } from '../../posts/domain/entities/posts.entity';
import { PostsViewModal } from '../../posts/schemas/posts.schema';

@Injectable()
export class CreatePostByBlogIdCommand {
  constructor(
    readonly blogId: string,
    readonly newPostByBlogId: CreatePostDto,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase implements ICommandHandler {
  constructor(
    public postsRepository: PostsSQLRepository,
    public blogsRepository: BlogsSqlRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog)
      throw new NotFoundException([
        {
          message: 'Blog with this id not found',
          field: 'blog',
        },
      ]);
    if (blog.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([
        { message: 'Its not your blog', field: 'blog' },
      ]);
    const postForDb = await this.postsRepository.savePost(
      command.user,
      blog,
      command.newPostByBlogId,
    );
    return {
      id: postForDb.id,
      title: postForDb.title,
      shortDescription: postForDb.shortDescription,
      content: postForDb.content,
      blogId: postForDb.blogId,
      blogName: postForDb.blogName,
      createdAt: postForDb.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
