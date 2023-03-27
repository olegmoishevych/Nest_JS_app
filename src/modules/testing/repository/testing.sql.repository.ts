import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments/domain/comments.entity';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class TestingSqlRepository {
  constructor(
    @InjectRepository(UserEntity)
    private usersTable: Repository<UserEntity>,
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
      // console.log('before delete', await this.usersTable.count());
      await this.usersTable.delete({});
      // console.log(res);
      // console.log('after delete', await this.usersTable.count());
      // console.log('before delete2', await this.usersTable.count());
      await this.usersTable.clear();
      // console.log(res2);
      // console.log('after delete2', await this.usersTable.count());
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
