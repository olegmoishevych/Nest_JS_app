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
import { ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import { CreatePostDto } from '../../posts/dto/createPostDto';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { UserModel } from '../../users/schemas/users.schema';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(
    paginationType: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsRepository.getBlogs(paginationType);
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

  async updateBlogById(id: string, user: BlogsDto): Promise<boolean> {
    const result = await this.blogsRepository.updateBlogById(id, user);
    if (!result) throw new NotFoundException(`User with ID ${id} not found`);
    return result;
  }

  async createPostByBlogId(
    blogId: string,
    newPostByBlogId: CreatePostDto,
  ): Promise<PostsViewModal> {
    const findBlogById = await this.blogsRepository.findBlogById(blogId);
    if (!findBlogById)
      throw new NotFoundException([
        {
          message: 'BlogId not found',
          field: 'BlogId',
        },
      ]);
    const newPost: PostsViewModal = {
      id: new ObjectId().toString(),
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
}
