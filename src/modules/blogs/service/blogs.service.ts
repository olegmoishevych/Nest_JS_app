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
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto, BlogsModal_For_DB } from '../dto/blogsDto';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import {
  CreatePostDto,
  PostsViewModalFor_DB,
} from '../../posts/dto/createPostDto';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { UserModel } from '../../users/schemas/users.schema';
import { PostsService } from '../../posts/service/posts.service';
import { UsersRepository } from '../../users/repository/users.repository';
import { BanUserForBloggerDto } from '../dto/bloggerDto';
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
    const blog = await this.blogsRepository.findBlogById(id);
    if (!blog) throw new NotFoundException(`Blog not found`);
    return blog;
  }

  async updateBlogById(
    id: string,
    user: BlogsDto,
    userId: string,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogWithUserInfoById(id);
    if (!blog) throw new NotFoundException(`Blog not found`);
    if (blog.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException(['It not your blog']);
    return this.blogsRepository.updateBlogById(id, user, userId);
  }

  async createPostByBlogId(
    blogId: string,
    newPostByBlogId: CreatePostDto,
    userId: string,
  ): Promise<PostsViewModal> {
    const blog = await this.blogsRepository.findBlogWithUserInfoById(blogId);
    if (!blog) throw new NotFoundException([]);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
    const newPost: PostsViewModalFor_DB = {
      id: new ObjectId().toString(),
      userId: userId,
      isUserBanned: false,
      isBlogBanned: false,
      title: newPostByBlogId.title,
      shortDescription: newPostByBlogId.shortDescription,
      content: newPostByBlogId.content,
      blogId: blogId,
      blogName: blog.name,
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
    id: string,
    banUserModal: BanUserForBloggerDto,
    userId: string,
  ): Promise<BlogsUserViewModel> {
    const user = await this.usersRepository.findUserById(id); // we find user in db
    if (!user) throw new NotFoundException(['User not found']);
    const blogWithOwner = await this.blogsRepository.findBlogWithOwnerId(
      banUserModal.blogId,
    );
    if (!blogWithOwner) throw new NotFoundException(['Blog not found']);
    if (blogWithOwner.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException([]); // 403 error
    const bannedUser: BlogsUserViewModelFor_DB = {
      id: id,
      login: user.login,
      blogId: banUserModal.blogId,
      banInfo: {
        isBanned: banUserModal.isBanned,
        banDate: new Date().toISOString(),
        banReason: banUserModal.banReason,
      },
    };
    return this.userBannedRepository.banUserById(bannedUser, id);
  }

  async getBannedUsers(
    blogId: string,
    pagination: BannedUserDto,
    userId: string,
  ): Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    const blog = await this.blogsRepository.findBlogWithOwnerId(blogId);
    if (!blog) throw new NotFoundException(['Blog not found']);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
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
