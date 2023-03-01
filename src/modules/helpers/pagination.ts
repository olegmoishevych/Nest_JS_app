import { Injectable } from '@nestjs/common';

export class Pagination {
  constructor(
    public searchNameTerm: string,
    public searchEmailTerm: string,
    public searchLoginTerm: string,
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: string,
  ) {}
}

@Injectable()
export class getPagination {
  constructor(query: any) {
    return {
      searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : '',
      searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : '',
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      searchNameTerm: query.searchNameTerm ? query.searchNameTerm : '',
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  }
}

// export const getPagination = (query: any): Pagination => {
//   //validation logic for fields
//   return {
//     searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : '',
//     searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : '',
//     pageNumber: query.pageNumber ? +query.pageNumber : 1,
//     searchNameTerm: query.searchNameTerm ? query.searchNameTerm : '',
//     pageSize: query.pageSize ? +query.pageSize : 10,
//     sortBy: query.sortBy ? query.sortBy : 'createdAt',
//     sortDirection: query.sortDirection ? query.sortDirection : 'desc',
//   };
// };

export const paginator = (
  pageNumber: number,
  pageSize: number,
  totalCount: number,
  items: any,
) => {
  const pagesCount = Math.ceil(totalCount / pageSize);
  return {
    pagesCount,
    page: pageNumber,
    pageSize,
    totalCount: totalCount,
    items,
  };
};
