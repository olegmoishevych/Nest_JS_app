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

  // async deleteAll(): Promise<boolean> {
  //   try {
  //     const entities = this.dataSource.entityMetadatas;
  //     const tableNames = entities
  //       .map((entity) => `"${entity.tableName}"`)
  //       .join(', ');
  //
  //     await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }

  async deleteAllData() {
    try {
      await this.usersTable.delete({});
      await this.usersTable.clear();
      await this.passwordRecoveryTable.delete({});
      await this.passwordRecoveryTable.clear();
      await this.postsTable.delete({});
      await this.postsTable.clear();
      await this.likesTable.delete({});
      await this.likesTable.clear();
      await this.emailConfirmationTable.delete({});
      await this.emailConfirmationTable.clear();
      await this.devicesTable.delete({});
      await this.devicesTable.clear();
      await this.commentsTable.delete({});
      await this.commentsTable.clear();
      await this.commentatorInfoTable.delete({});
      await this.commentatorInfoTable.clear();
      await this.blogsTable.delete({});
      await this.blogsTable.clear();
      await this.bannedUserForBlogTable.delete({});
      await this.bannedUserForBlogTable.clear();
      await this.banInfoTable.delete({});
      await this.banInfoTable.clear();
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
    //     try {
    //       // await this.connection.db.dropDatabase();
    //       await this.dataSource.query(`
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
    //       return;
    //     } catch (e) {
    //       console.log(e);
    //     }
  }
}
