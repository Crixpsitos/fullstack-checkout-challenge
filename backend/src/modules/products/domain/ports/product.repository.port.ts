import { type ProductFilterDto } from '../../infrastructure/http/dto/product-filter.dto';
import { Product } from '../entities/product.entity';
import { PaginationResult } from '../../../../shared/interfaces/pagination-result.interface';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findAll(filter: ProductFilterDto): Promise<PaginationResult<Product>>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
