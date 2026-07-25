export enum ProductErrorCode {
  NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_CATEGORY = 'PRODUCT_INVALID_CATEGORY',
}

export class ProductNotFoundError extends Error {
  readonly code = ProductErrorCode.NOT_FOUND;
  constructor(id: string) {
    super(`Producto ${id} no encontrado`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductInvalidCategoryError extends Error {
  readonly code = ProductErrorCode.INVALID_CATEGORY;
  constructor(categoryId: number) {
    super(`La categoría ${categoryId} no existe`);
    this.name = 'ProductInvalidCategoryError';
  }
}

export type ProductError = ProductNotFoundError | ProductInvalidCategoryError;
