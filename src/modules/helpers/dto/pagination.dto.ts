import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

const toInt = (value: any, min: number, defaultValue: number): number => {
  try {
    const parsedInt = parseInt(value, 10);
    if (isNaN(parsedInt)) return defaultValue;
    if (parsedInt < min) return defaultValue;
    return parsedInt;
  } catch {
    return defaultValue;
  }
};

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Transform((v) => {
    return toInt(v.value, 1, 1);
  })
  pageNumber = 1;
  @IsOptional()
  @IsInt()
  @Transform((v) => {
    return toInt(v.value, 1, 10);
  })
  pageSize = 10;
  @IsOptional()
  sortBy = 'createdAt';
  @IsOptional()
  sortDirection = 'desc';
  public getSkipSize() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum PublishedStatusFilterEnum {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export class QuizQuestionsPaginationDto extends PaginationDto {
  @IsOptional()
  bodySearchTerm: string | null = null;
  @IsOptional()
  publishedStatus: PublishedStatusFilterEnum = PublishedStatusFilterEnum.All;
}

export class BannedUserDto extends PaginationDto {
  @IsOptional()
  searchLoginTerm: string | null = null;
}

export class BlogPaginationDto extends PaginationDto {
  @IsOptional()
  searchNameTerm = '';
}

export class UserPaginationDto extends PaginationDto {
  @IsOptional()
  searchLoginTerm: string | null = '';
  @IsOptional()
  searchEmailTerm: string | null = '';
}

export enum BanStatusFilterEnum {
  All = 'all',
  Banned = 'banned',
  NotBanned = 'notBanned',
}
export class UserPaginationDtoWithBanStatusDto extends UserPaginationDto {
  @IsOptional()
  banStatus: BanStatusFilterEnum = BanStatusFilterEnum.All;
}
