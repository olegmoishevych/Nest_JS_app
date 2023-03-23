import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { CreatePostDtoWithBlogId } from '../dto/createPostDto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { BlogsSqlRepository } from '../../blogs/repository/blogs.sql.repository';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { PostsEntity } from '../domain/entities/posts.entity';

@Injectable()
export class UpdatePostByIdCommand {
  constructor(
    readonly id: string,
    readonly updatePost: CreatePostDtoWithBlogId,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase implements ICommand {
  constructor(
    public blogsRepo: BlogsSqlRepository,
    public postsRepo: PostsSQLRepository,
  ) {}

  async execute(command: UpdatePostByIdCommand): Promise<PostsEntity> {
    const blog = await this.blogsRepo.findBlogById(command.updatePost.blogId);
    if (!blog) throw new BadRequestException([]);
    if (blog.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]);
    const updatePost = new PostsEntity();
    updatePost.updatePostByBlogsAndPostsId(updatePost);
    // return this.postsRepo.savePost(command.user, blog, command.updatePost);
    return this.postsRepo.save(updatePost);
  }
}
