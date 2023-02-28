import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  searchNameTerm?: string = '';
  pageNumber?: string = '1';
  pageSize?: string = '10';
  sortBy?: string = 'createdAt';
  sortDirection?: string = 'desc';
}
