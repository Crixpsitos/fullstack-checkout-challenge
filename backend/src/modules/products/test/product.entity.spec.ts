import { Product } from '../domain/entities/product.entity';

const validProps = {
  name: 'Laptop Lenovo',
  description: 'Laptop de alta gama',
  price: 2500000,
  stock: 10,
  imageUrl: 'https://example.com/laptop.jpg',
  categoryId: 1,
};

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('Product Entity', () => {
  describe('create()', () => {
    it('crea un producto con UUID generado', () => {
      const product = Product.create(validProps);

      expect(product.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(product.name).toBe('Laptop Lenovo');
      expect(product.price).toBe(2500000);
      expect(product.stock).toBe(10);
      expect(product.category).toEqual({ id: 1 });
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it('aplica trim al nombre y descripción', () => {
      const product = Product.create({
        ...validProps,
        name: '  Laptop  ',
        description: '  Descripción  ',
      });
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('Descripción');
    });

    it('lanza error si el precio es negativo', () => {
      expect(() => Product.create({ ...validProps, price: -1 })).toThrow(
        'El precio no puede ser negativo',
      );
    });

    it('lanza error si el stock es negativo', () => {
      expect(() => Product.create({ ...validProps, stock: -1 })).toThrow(
        'El stock no puede ser negativo',
      );
    });

    it('acepta precio en cero', () => {
      expect(() => Product.create({ ...validProps, price: 0 })).not.toThrow();
    });

    it('acepta stock en cero', () => {
      expect(() => Product.create({ ...validProps, stock: 0 })).not.toThrow();
    });
  });

  describe('reconstitute()', () => {
    it('restaura preservando id y fechas originales', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-06-01');

      const product = Product.reconstitute({
        id: validUUID,
        name: 'Laptop',
        description: 'Desc',
        price: 100,
        stock: 5,
        imageUrl: 'https://img.com/img.jpg',
        category: { id: 2, name: 'Electrónica', slug: 'electronica' },
        createdAt,
        updatedAt,
      });

      expect(product.id).toBe(validUUID);
      expect(product.createdAt).toBe(createdAt);
      expect(product.updatedAt).toBe(updatedAt);
      expect(product.category.name).toBe('Electrónica');
    });
  });

  describe('hasStock()', () => {
    it('retorna true si hay suficiente stock', () => {
      const product = Product.create({ ...validProps, stock: 5 });
      expect(product.hasStock(5)).toBe(true);
      expect(product.hasStock(3)).toBe(true);
    });

    it('retorna false si no hay suficiente stock', () => {
      const product = Product.create({ ...validProps, stock: 2 });
      expect(product.hasStock(3)).toBe(false);
    });

    it('retorna false si stock es 0', () => {
      const product = Product.create({ ...validProps, stock: 0 });
      expect(product.hasStock(1)).toBe(false);
    });
  });
});
