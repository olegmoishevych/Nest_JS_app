import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto, BlogsModal_For_DB } from '../dto/blogsDto';
import { Model } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import {
  CreatePostDto,
  CreatePostDtoWithBlogId,
  PostsViewModalFor_DB,
} from '../../posts/dto/createPostDto';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { UserModel } from '../../users/schemas/users.schema';
import { PostsService } from '../../posts/service/posts.service';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private postsService: PostsService,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(
    paginationType: BlogPaginationDto,
    user: boolean,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsRepository.getBlogs(paginationType, user);
  }

  async createBlog(blog: BlogsDto, user: UserModel): Promise<BlogsViewModel> {
    const newBlog: BlogsModal_For_DB = {
      id: new ObjectId().toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    };
    return this.blogsRepository.createBlog({ ...newBlog });
  }

  async deleteBlogById(id: string, userId: string): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogById(id);
    if (!findBlogById)
      throw new NotFoundException(`User with ID ${id} not found`);
    if (findBlogById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]);
    return this.blogsRepository.deleteBlogById(id);
  }

  async findBlogById(id: string): Promise<BlogsViewModel> {
    const findBlogById = await this.blogsRepository.findBlogById(id);
    if (!findBlogById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return findBlogById;
  }

  async updateBlogById(
    id: string,
    user: BlogsDto,
    userId: string,
  ): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogById(id);
    if (!findBlogById) throw new NotFoundException(`Blog not found`);
    if (findBlogById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException(['It not your blog']);
    return this.blogsRepository.updateBlogById(id, user, userId);
  }

  async createPostByBlogId(
    blogId: string,
    newPostByBlogId: CreatePostDto,
    userId: string,
  ): Promise<PostsViewModal> {
    const findBlogById = await this.blogsRepository.findBlogById(blogId);
    if (!findBlogById) throw new NotFoundException([]);
    if (findBlogById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]);
    const newPost: PostsViewModalFor_DB = {
      id: new ObjectId().toString(),
      userId: userId,
      isUserBanned: false,
      title: newPostByBlogId.title,
      shortDescription: newPostByBlogId.shortDescription,
      content: newPostByBlogId.content,
      blogId: blogId,
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
  async updatePostByBlogsAndPostsId(
    postId: string,
    blogId: string,
    userId: string,
    updatePost: CreatePostDto,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException([]);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException([]);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
    return this.postsRepository.updatePostById(postId, updatePost, userId);
  }
  async deletePostByBlogsAndPostsId(
    postId: string,
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException([]);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException([]);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
    return this.postsRepository.deletePostById(postId, userId);
  }
  async bindWithUser(blogId: string, userId: string) {
    const bindBLogWithUserById = {};
  }
}
