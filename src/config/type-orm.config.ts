import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private envType = this.configService.get('NODE_ENV');

  private getDevelopmentSettings(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('POSTGRES_HOST'),
      port: parseInt(this.configService.get('POSTGRES_PORT'), 10),
      username: 'postgres',
      password: 'sa',
      database: 'Bloggers',
      synchronize: true,
      autoLoadEntities: true,
    };
  }

  private getProductionSettings(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('SQL_URL'),
      ssl: true,
      synchronize: true,
      autoLoadEntities: true,
    };
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    switch (this.envType) {
      case 'development':
        return this.getDevelopmentSettings();
      case 'production':
        return this.getProductionSettings();
      default:
        return this.getProductionSettings();
    }
  }
}
