import { Expose, Transform, Type } from 'class-transformer';
import { CategorySummaryDto } from './category-summary.dto';

export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  price!: number;

  @Expose()
  stock!: number;

  @Expose()
  images!: string[];

  @Expose()
  @Type(() => CategorySummaryDto)
  category!: CategorySummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
