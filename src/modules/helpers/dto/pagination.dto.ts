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
  pageNumber: number | null = 1;
  @IsOptional()
  @IsInt()
  @Transform((v) => {
    return toInt(v.value, 1, 10);
  })
  pageSize: number | null = 10;
  @IsOptional()
  sortBy: string | null = 'createdAt';
  @IsOptional()
  sortDirection: string | null = 'desc';

  public getSkipSize() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export class BlogPaginationDto extends PaginationDto {
  @IsOptional()
  searchNameTerm: string | null = null;
}

export class UserPaginationDto extends PaginationDto {
  @IsOptional()
  searchLoginTerm: string | null = null;
  @IsOptional()
  searchEmailTerm: string | null = null;
}
