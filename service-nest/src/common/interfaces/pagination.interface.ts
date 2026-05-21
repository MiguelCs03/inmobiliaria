export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface PaginationLinks {
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}
