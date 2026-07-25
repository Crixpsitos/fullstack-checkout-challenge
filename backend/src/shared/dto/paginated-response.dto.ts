import { PaginationResult } from 'src/shared/interfaces/pagination-result.interface';
import { Request } from 'express';

export class PaginatedResponseDto<T> {
  items!: T[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  nextPage!: string | null;
  previousPage!: string | null;

  static fromResult<T>(
    result: PaginationResult<T>,
    req: Request,
  ): PaginatedResponseDto<T> {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;

    const dto = new PaginatedResponseDto<T>();
    dto.items = result.items;
    dto.total = result.total;
    dto.page = result.page;
    dto.limit = result.limit;
    dto.totalPages = result.totalPages;
    dto.nextPage = result.nextPage
      ? `${baseUrl}?page=${result.nextPage}&limit=${result.limit}`
      : null;
    dto.previousPage = result.previousPage
      ? `${baseUrl}?page=${result.previousPage}&limit=${result.limit}`
      : null;

    return dto;
  }
}
