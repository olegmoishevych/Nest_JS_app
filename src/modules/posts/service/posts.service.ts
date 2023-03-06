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
import { LikeStatusModal } from '../../comments/schema/likeStatus.schema';
import { UserModel } from '../../users/schemas/users.schema';
import { LikeStatusRepository } from '../repository/likeStatus.repository';

@Injectable()
export class PostsService {
  constructor(
    public blogsRepository: BlogsRepository,
    public postsRepository: PostsRepository,
    public likeStatusRepository: LikeStatusRepository,
  ) {}

  async findPosts(
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsRepository.findPosts(paginationDto, userId);
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

  async findPostById(id: string, userId: string): Promise<PostsViewModal> {
    const findPostById = await this.postsRepository.findPostById(id);
    if (!findPostById) throw new NotFoundException(`Post not found`);
    const postWithLikesStatus =
      await this.likeStatusRepository.postWithLikeStatus(findPostById, userId);
    return postWithLikesStatus[0];
  }

  async findPostByBlogId(
    blogId: string,
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<PostsViewModal>> {
    const findBlogById = await this.blogsRepository.findBlogById(blogId);
    if (!findBlogById) throw new NotFoundException(`Post not found`);
    const findAndSortedPosts = await this.postsRepository.findPostsByBlogId(
      blogId,
      paginationDto,
    );
    const postsWithLikesStatus =
      await this.likeStatusRepository.postWithLikeStatus(
        findAndSortedPosts.items,
        userId,
      );
    const postsCountByBlogId = await this.postsRepository.getCountPostsByBlogId(
      blogId,
    );
    return new PaginationViewModel<any>(
      postsCountByBlogId,
      paginationDto.pageNumber,
      paginationDto.pageSize,
      postsWithLikesStatus,
    );
  }

  async createCommentByPostId(
    postId: string,
    commentsDto: CommentsDto,
    user: UserModel,
  ): Promise<CommentsViewModal> {
    const findPostById: any = await this.postsRepository.findPostById(postId);
    if (!findPostById)
      throw new NotFoundException(`Post with ID ${postId} not found`);
    const newComment: CommentsViewModal = {
      id: new ObjectId().toString(),
      postId: findPostById.id,
      content: commentsDto.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
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

  async findPostByIdAndUpdateLikeStatus(
    postId: string,
    likeStatus: string,
    user: UserModel,
  ) {
    const findPostById = await this.postsRepository.findPostById(postId);
    if (!findPostById)
      throw new NotFoundException([
        { message: 'Post not found', field: 'post' },
      ]);

    const updateLikeStatusByPostId = new LikeStatusModal(
      postId,
      user.id,
      user.login,
      likeStatus,
      new Date(),
    );

    try {
      await this.likeStatusRepository.updateLikeStatusByPostId(
        updateLikeStatusByPostId,
      );
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
