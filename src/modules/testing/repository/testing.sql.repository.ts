import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class TestingSqlRepository {
  constructor(
    private dataSource: DataSource,
    private userTable: Repository<UserEntity>,
  ) {}

  async deleteAllData() {
    await this.userTable.delete({});
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
