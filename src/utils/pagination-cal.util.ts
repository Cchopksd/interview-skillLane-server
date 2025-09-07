export const PaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
): {
  page: number;
  skip: number;
  limit: number;
  totalPages: number;
  totalItems: number;
} => {
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalItems / limit);
  return { page, skip, limit, totalPages, totalItems };
};

export interface PaginationMetaInterface {
  page: number;
  skip: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export type Paginated<T> = {
  meta: PaginationMetaInterface;
  data: T[];
};
