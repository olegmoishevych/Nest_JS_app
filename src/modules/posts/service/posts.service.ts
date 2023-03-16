import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from '../repository/posts.repository';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { CreatePostDtoWithBlogId } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';
import { ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { CommentsDto } from '../../comments/dto/comments.dto';
import {
  CommentsViewModal,
  CommentsViewModalFor_DB,
} from '../../comments/schema/comments.schema';
import { LikeStatusModalFor_Db } from '../../comments/schema/likeStatus.schema';
import { UserModel } from '../../users/schemas/users.schema';
import { LikeStatusRepository } from '../repository/likeStatus.repository';
import { UserBannedRepository } from '../../blogs/repository/user-banned.repository';

@Injectable()
export class PostsService {
  constructor(
    public blogsRepository: BlogsRepository,
    public postsRepository: PostsRepository,
    public likeStatusRepository: LikeStatusRepository,
    public userBannedRepository: UserBannedRepository,
  ) {}

  async findPosts(
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsRepository.findPosts(paginationDto, userId);
  }

  async updatePostById(
    id: string,
    post: CreatePostDtoWithBlogId,
    userId: string,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogWithUserInfoById(
      post.blogId,
    );
    if (!blog) throw new BadRequestException([]);
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException([]);
    return this.postsRepository.updatePostById(id, post, userId);
  }

  async findPostById(id: string, userId: string): Promise<PostsViewModal> {
    const post = await this.postsRepository.findPostById(id);
    if (!post) throw new NotFoundException(`Post not found`);
    return this.likeStatusRepository.postWithLikeStatus(post, userId);
  }

  async findPostByBlogId(
    blogId: string,
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog not found`);
    const findAndSortedPosts = await this.postsRepository.findPostsByBlogId(
      blogId,
      paginationDto,
    );
    const postsWithLikesStatus =
      await this.likeStatusRepository.postsWithLikeStatus(
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
    const post: any = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException([]);
    const userInBanList =
      await this.userBannedRepository.findBannedUserByUserId(user.id);
    if (userInBanList) throw new ForbiddenException([]);
    const newComment: CommentsViewModalFor_DB = {
      id: new ObjectId().toString(),
      isUserBanned: false,
      postId: post.id,
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
      postInfo: {
        id: post.id,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
      },
    };
    return this.postsRepository.createCommentByPostId(newComment);
  }

  async findPostByIdAndUpdateLikeStatus(
    postId: string,
    likeStatus: string,
    user: UserModel,
  ): Promise<boolean> {
    const post = await this.postsRepository.findPostById(postId);
    if (!post)
      throw new NotFoundException([
        { message: 'Post not found', field: 'post' },
      ]);
    const updateLikeStatusByPostId = new LikeStatusModalFor_Db(
      postId,
      false,
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
