import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../repository/posts.repository';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { CreatePostDtoWithBlogId } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';
import { ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { CommentsDto } from '../../comments/dto/comments.dto';
import { CommentsViewModal } from '../../comments/schema/comments.schema';

@Injectable()
export class PostsService {
  constructor(
    public blogsRepository: BlogsRepository,
    public postsRepository: PostsRepository,
  ) {}

  async findPosts(
    paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsRepository.findPosts(paginationDto);
  }

  async createPost(
    createPost: CreatePostDtoWithBlogId,
  ): Promise<PostsViewModal> {
    const findBlogById = await this.blogsRepository.findBlogById(
      createPost.blogId,
    );
    if (!findBlogById) throw new NotFoundException([]);
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

  async deletePostById(id: string): Promise<boolean> {
    const findPostById = await this.postsRepository.findPostById(id);
    if (!findPostById)
      throw new NotFoundException(`Post with ID ${id} not found`);
    return this.postsRepository.deletePostById(id);
  }

  async updatePostById(
    id: string,
    post: CreatePostDtoWithBlogId,
  ): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogById(post.blogId);
    if (!findBlogById)
      throw new NotFoundException(`Post with ID ${id} not found`);
    const updatedPost = await this.postsRepository.updatePostById(id, post);
    if (!updatedPost)
      throw new NotFoundException(`Post with ID ${id} not found`);
    return updatedPost;
  }

  async findPostById(id: string): Promise<PostsViewModal[]> {
    const findPostById = await this.postsRepository.findPostById(id);
    if (!findPostById)
      throw new NotFoundException(`Post with ID ${id} not found`);
    return findPostById;
  }

  async findPostByBlogId(
    blogId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    const findBlogById = await this.blogsRepository.findBlogById(blogId);
    if (!findBlogById)
      throw new NotFoundException(`Post with ID ${blogId} not found`);
    return this.postsRepository.findPostsByBlogId(blogId, paginationDto);
  }
  async findCommentsByPostId() {}
  async createCommentByPostId(
    postId: string,
    commentsDto: CommentsDto,
  ): Promise<CommentsViewModal[]> {
    const findPostById: any = await this.postsRepository.findPostById(postId);
    if (!findPostById)
      throw new NotFoundException(`Post with ID ${postId} not found`);
    const newComment: CommentsViewModal = {
      id: new ObjectId().toString(),
      postId: findPostById.id,
      content: commentsDto.content,
      commentatorInfo: {
        userId: new ObjectId().toString(),
        userLogin: new ObjectId().toString(),
      },
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
    return this.postsRepository.createCommentByPostId(newComment);
  }
}
