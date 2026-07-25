export enum CategoryErrorCode {
  NOT_FOUND = 'CATEGORY_NOT_FOUND',
  SLUG_CONFLICT = 'CATEGORY_SLUG_CONFLICT',
}

export class CategoryNotFoundError extends Error {
  readonly code = CategoryErrorCode.NOT_FOUND;
  constructor(id: number) {
    super(`Categoría ${id} no encontrada`);
    this.name = 'CategoryNotFoundError';
  }
}

export class CategorySlugConflictError extends Error {
  readonly code = CategoryErrorCode.SLUG_CONFLICT;
  constructor(slug: string) {
    super(`Ya existe una categoría con el slug "${slug}"`);
    this.name = 'CategorySlugConflictError';
  }
}

export type CategoryError = CategoryNotFoundError | CategorySlugConflictError;
