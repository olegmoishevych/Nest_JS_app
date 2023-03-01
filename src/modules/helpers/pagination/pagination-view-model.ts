const getPagesCount = (totalCount: number, pageSize: number): number => {
  const res = Math.ceil(totalCount / pageSize);
  return res === 0 ? 1 : res;
};

export class PaginationViewModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;

  constructor(totalCount: number, page: number, pageSize: number, items: T) {
    this.pagesCount = getPagesCount(totalCount, pageSize);
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.items = items;
  }
}
