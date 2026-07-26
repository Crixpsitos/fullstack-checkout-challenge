import { randomUUID } from 'crypto';

export interface ProductCategory {
  id: number;
  name?: string;
  slug?: string;
}

export class Product {
  private constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public images: string[],
    public category: ProductCategory,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(properties: {
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: number;
  }): Product {
    if (properties.price < 0)
      throw new Error('El precio no puede ser negativo');
    if (properties.stock < 0) throw new Error('El stock no puede ser negativo');
    const now = new Date();
    return new Product(
      randomUUID(),
      properties.name.trim(),
      properties.description.trim(),
      properties.price,
      properties.stock,
      properties.images,
      { id: properties.categoryId },
      now,
      now,
    );
  }

  static reconstitute(properties: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    category: ProductCategory;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      properties.id,
      properties.name,
      properties.description,
      properties.price,
      properties.stock,
      properties.images,
      properties.category,
      properties.createdAt,
      properties.updatedAt,
    );
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }
}
