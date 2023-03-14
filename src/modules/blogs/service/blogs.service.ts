import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BanInfo,
  Blogs,
  BlogsDocument,
  BlogsViewModel,
} from '../schemas/blogs.schema';
import { BlogsRepository } from '../repository/blogs.repository';
import {
  BannedUserDto,
  BlogPaginationDto,
} from '../../helpers/dto/pagination.dto';
import { BlogsDto, BlogsModal_For_DB } from '../dto/blogsDto';
import { Model } from 'mongoose';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
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
import { UsersService } from '../../users/service/users.service';
import { UsersRepository } from '../../users/repository/users.repository';
import { BanUserForBloggerDto } from '../dto/bloggerDto';
import { BanBlogUserDto, BanUserDto } from '../../users/dto/userDto';
import {
  BlogsUserViewModel,
  BlogsUserViewModelFor_DB,
} from '../schemas/user-banned.schema';
import { UserBannedRepository } from '../repository/user-banned.repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private postsService: PostsService,
    private usersRepository: UsersRepository,
    private userBannedRepository: UserBannedRepository,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  // async getBlogs(
  //   paginationType: BlogPaginationDto,
  //   admin: boolean,
  //   user?: UserModel,
  // ): Promise<PaginationViewModel<BlogsViewModel[]>> {
  //   return this.blogsRepository.getBlogs(paginationType, admin, user);
  // }
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
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    };
    return this.blogsRepository.createBlog({ ...newBlog });
  }

  async deleteBlogById(id: string, userId: string): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogWithUserInfoById(
      id,
    );
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
    const findBlogById = await this.blogsRepository.findBlogWithUserInfoById(
      id,
    );
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
    const findBlogById = await this.blogsRepository.findBlogWithUserInfoById(
      blogId,
    );
    // console.log('findBlogById', findBlogById);
    if (!findBlogById) throw new NotFoundException([]);
    if (findBlogById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]);
    const newPost: PostsViewModalFor_DB = {
      id: new ObjectId().toString(),
      userId: userId,
      isUserBanned: false,
      isBlogBanned: false,
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
    const blog = await this.blogsRepository.findBlogWithUserInfoById(blogId);
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
    const blog = await this.blogsRepository.findBlogWithUserInfoById(blogId);
    if (!blog) throw new NotFoundException([]);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException([]);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
    return this.postsRepository.deletePostById(postId, userId);
  }
  async banUserById(
    ownerId: string,
    banUserModal: BanUserForBloggerDto,
    userId: string,
  ): Promise<BlogsUserViewModel> {
    const findUserById = await this.usersRepository.findUserById(ownerId);
    if (!findUserById) throw new NotFoundException(['User not found']);
    const findBlogWithOwnerById =
      await this.blogsRepository.findBlogWithOwnerId(banUserModal.blogId);
    if (!findBlogWithOwnerById) throw new NotFoundException(['Blog not found']);
    if (findBlogWithOwnerById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]);
    const bannedUser: BlogsUserViewModelFor_DB = {
      id: ownerId,
      login: findUserById.login,
      blogId: banUserModal.blogId,
      banInfo: {
        isBanned: banUserModal.isBanned,
        banDate: new Date().toISOString(),
        banReason: banUserModal.banReason,
      },
    };
    return this.userBannedRepository.banUserById(bannedUser);
  }
  async getBannedUsers(
    blogId: string,
    pagination: BannedUserDto,
    userId: string,
  ): Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    const blogById = await this.blogsRepository.findBlogWithOwnerId(blogId);
    if (!blogById) throw new NotFoundException(['Blog not found']);
    if (blogById.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]);
    const bannedUser = await this.userBannedRepository.findBannedUserByBlogId(
      blogId,
    );
    if (!bannedUser) throw new NotFoundException(['User by id not found']);
    return this.userBannedRepository.getBannedUsersForBlog(blogId, pagination);
  }
  async banBlogById(blogId: string, isBanned: boolean): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogByIdForBannedUser(
      blogId,
    );
    if (!findBlogById) throw new NotFoundException([]);
    const updateBlog: BanInfo = findBlogById.banInfo.isBanned
      ? { isBanned: false, banDate: null }
      : { isBanned: true, banDate: new Date() };
    try {
      await this.postsRepository.findUsersPostByIdAndChangeBlockStatus(
        blogId,
        isBanned,
      );
      await this.blogsRepository.banBlogById(blogId, updateBlog);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
