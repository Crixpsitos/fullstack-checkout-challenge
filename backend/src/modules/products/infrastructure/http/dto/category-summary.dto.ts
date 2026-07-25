import { Expose } from 'class-transformer';

export class CategorySummaryDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;
}
