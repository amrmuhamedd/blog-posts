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
