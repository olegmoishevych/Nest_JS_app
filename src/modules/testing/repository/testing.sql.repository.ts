import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments/domain/comments.entity';

@Injectable()
export class TestingSqlRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CommentsEntity)
    private usersTable: Repository<UserEntity>,
  ) {}

  async deleteAllData() {
    await this.usersTable.delete({});
    try {
      await this.dataSource.query(`
        CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;
SELECT truncate_tables('postgres');`);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
