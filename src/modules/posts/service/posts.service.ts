import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../repository/posts.repository';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { CreatePostDto } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsService {
  constructor(
    public blogsRepository: BlogsRepository,
    public postsRepository: PostsRepository,
  ) {}
  async createPost(createPost: CreatePostDto): Promise<PostsViewModal> {
    const findBlogById = await this.blogsRepository.findBlogById(
      createPost.blogId,
    );
    if (!findBlogById)
      throw new NotFoundException(
        `Blog with ID ${createPost.blogId} not found`,
      );
    const newPost: PostsViewModal = {
      id: new ObjectId().toString(),
      title: createPost.title,
      shortDescription: createPost.shortDescription,
      content: createPost.content,
      blogId: createPost.blogId,
      blogName: findBlogById.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
    return this.postsRepository.createPost(newPost);
  }
}
