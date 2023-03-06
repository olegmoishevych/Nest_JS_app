import { Injectable } from '@nestjs/common';

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
