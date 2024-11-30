import { BasResponse } from "./baseResponse";

export interface pagination<T> {
  currentPage: string | number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number | null;
  totalDocs: number | null;
  data: T[];
}

export type PaginationResponse<T> = BasResponse<pagination<T>>;

export function createPagination<T>(params: {
  page: number | string;
  pageSize: number | string;
  total: number;
  data: T[];
}): pagination<T> {
  const { page, pageSize, total, data } = params;
  const currentPage = Number(page);
  const totalPages = Math.ceil(total / Number(pageSize));

  return {
    currentPage,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    totalPages,
    totalDocs: total,
    data
  };
}
