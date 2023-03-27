import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments/domain/comments.entity';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PasswordRecoveryEntity } from '../../auth/domain/entities/passwordRecoveryEntity';
import { PostsEntity } from '../../posts/domain/entities/posts.entity';
import { LikesEntity } from '../../posts/domain/entities/likes.entity';
import { EmailConfirmationEntity } from '../../auth/domain/entities/email.Confirmation.entity';
import { DevicesEntity } from '../../devices/domain/entities/devices.entity';
import { CommentatorInfoEntity } from '../../comments/domain/commentatorInfo.entity';
import { BlogsEntity } from '../../blogs/domain/entities/blogs.entity';
import { BannedUserForBlogEntity } from '../../blogs/domain/entities/banned-user-for-blog.entity';
import { BanInfoEntity } from '../../auth/domain/entities/ban-info.entity';

@Injectable()
export class TestingSqlRepository {
  constructor(
    @InjectRepository(UserEntity)
    private usersTable: Repository<UserEntity>,
    @InjectRepository(PasswordRecoveryEntity)
    private passwordRecoveryTable: Repository<PasswordRecoveryEntity>,
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
    @InjectRepository(EmailConfirmationEntity)
    private emailConfirmationTable: Repository<EmailConfirmationEntity>,
    @InjectRepository(DevicesEntity)
    private devicesTable: Repository<DevicesEntity>,
    @InjectRepository(CommentsEntity)
    private commentsTable: Repository<CommentsEntity>,
    @InjectRepository(CommentatorInfoEntity)
    private commentatorInfoTable: Repository<CommentatorInfoEntity>,
    @InjectRepository(BlogsEntity)
    private blogsTable: Repository<BlogsEntity>,
    @InjectRepository(BannedUserForBlogEntity)
    private bannedUserForBlogTable: Repository<BannedUserForBlogEntity>,
    @InjectRepository(BanInfoEntity)
    private banInfoTable: Repository<BanInfoEntity>,
    private dataSource: DataSource,
  ) {}

  async deleteAll(): Promise<boolean> {
    try {
      await Promise.all([
        this.usersTable.delete({}),
        this.usersTable.clear(),
        this.passwordRecoveryTable.delete({}),
        this.passwordRecoveryTable.clear(),
        this.postsTable.delete({}),
        this.postsTable.clear(),
        this.likesTable.delete({}),
        this.likesTable.clear(),
        this.emailConfirmationTable.delete({}),
        this.emailConfirmationTable.clear(),
        this.devicesTable.delete({}),
        this.devicesTable.clear(),
        this.commentsTable.delete({}),
        this.commentsTable.clear(),
        this.commentatorInfoTable.delete({}),
        this.commentatorInfoTable.clear(),
        this.blogsTable.delete({}),
        this.blogsTable.clear(),
        this.bannedUserForBlogTable.delete({}),
        this.bannedUserForBlogTable.clear(),
        this.banInfoTable.delete({}),
        this.banInfoTable.clear(),
      ]);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  //   try {
  //     // await this.connection.db.dropDatabase();
  //     await this.dataSource.query(`
  //         CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
  // DECLARE
  //     statements CURSOR FOR
  //         SELECT tablename FROM pg_tables
  //         WHERE tableowner = username AND schemaname = 'public';
  // BEGIN
  //     FOR stmt IN statements LOOP
  //         EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
  //     END LOOP;
  // END;
  // $$ LANGUAGE plpgsql;
  // SELECT truncate_tables('postgres');
  // SELECT truncate_tables('neondb');
  //         `);
  //     return true;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}
