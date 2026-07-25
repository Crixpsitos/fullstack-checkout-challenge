import { ProductTypeOrmRepository } from '../infrastructure/persistence/typeorm/repository/product.typeorm.repository';
import { ProductOrmEntity } from '../infrastructure/persistence/typeorm/schema/product.orm-entity';
import { Product } from '../domain/entities/product.entity';
import { CategoryOrmEntity } from '../../categories/infrastructure/persistence/typeorm/schema/category.orm-entity';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const makeCategoryOrm = (): CategoryOrmEntity =>
  ({
    id: 1,
    name: 'Electrónica',
    slug: 'electronica',
    description: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    products: [],
  }) as CategoryOrmEntity;

const makeOrmRow = (overrides: Partial<ProductOrmEntity> = {}): ProductOrmEntity =>
  ({
    id: validUUID,
    name: 'Laptop',
    description: 'Desc',
    price: 1000,
    stock: 5,
    imageUrl: 'https://img.com/img.jpg',
    category: makeCategoryOrm(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    ...overrides,
  }) as ProductOrmEntity;

// Mock del QueryBuilder encadenado
const makeQb = (rows: ProductOrmEntity[] = [], total = 0) => {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([rows, total]),
  };
  return qb;
};

const mockTypeOrmRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  createQueryBuilder: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ProductTypeOrmRepository', () => {
  let repository: ProductTypeOrmRepository;
  let ormRepo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(() => {
    ormRepo = mockTypeOrmRepo();
    repository = new ProductTypeOrmRepository(ormRepo as any);
  });

  describe('toDomain (via findById)', () => {
    it('mapea correctamente ORM entity a Product de dominio', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());

      const product = await repository.findById(validUUID);

      expect(product).toBeInstanceOf(Product);
      expect(product!.id).toBe(validUUID);
      expect(product!.name).toBe('Laptop');
      expect(product!.price).toBe(1000);
      expect(product!.category).toEqual({ id: 1, name: 'Electrónica', slug: 'electronica' });
    });

    it('convierte price de string a number (decimal de postgres)', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow({ price: '1500.50' as any }));

      const product = await repository.findById(validUUID);
      expect(typeof product!.price).toBe('number');
      expect(product!.price).toBe(1500.5);
    });

    it('preserva las fechas originales de la DB', async () => {
      const createdAt = new Date('2023-05-10');
      ormRepo.findOne.mockResolvedValue(makeOrmRow({ createdAt }));

      const product = await repository.findById(validUUID);
      expect(product!.createdAt).toEqual(createdAt);
    });

    it('retorna null si no encuentra la fila', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      const result = await repository.findById(validUUID);
      expect(result).toBeNull();
    });
  });

  describe('findAll() con filtros', () => {
    it('retorna PaginationResult sin filtros', async () => {
      const qb = makeQb([makeOrmRow()], 1);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.nextPage).toBeNull();
      expect(result.previousPage).toBeNull();
      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('aplica filtro por categoryId', async () => {
      const qb = makeQb([], 0);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, categoryId: 3 });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'category.id = :categoryId',
        { categoryId: 3 },
      );
    });

    it('aplica filtro por minPrice', async () => {
      const qb = makeQb([], 0);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, minPrice: 500 });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 500 },
      );
    });

    it('aplica filtro por maxPrice', async () => {
      const qb = makeQb([], 0);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, maxPrice: 2000 });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 2000 },
      );
    });

    it('aplica filtro por q (texto)', async () => {
      const qb = makeQb([], 0);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, q: 'laptop' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(LOWER(product.name) LIKE LOWER(:q) OR LOWER(product.description) LIKE LOWER(:q))',
        { q: '%laptop%' },
      );
    });

    it('calcula nextPage y previousPage correctamente', async () => {
      const qb = makeQb([makeOrmRow()], 25);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await repository.findAll({ page: 2, limit: 10 });
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.nextPage).toBe(3);
      expect(result.previousPage).toBe(1);
    });

    it('aplica todos los filtros simultáneamente', async () => {
      const qb = makeQb([], 0);
      ormRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({
        page: 1, limit: 5,
        categoryId: 2, minPrice: 100, maxPrice: 5000, q: 'laptop',
      });
      expect(qb.andWhere).toHaveBeenCalledTimes(4);
    });
  });

  describe('save()', () => {
    it('persiste y retorna el dominio mapeado', async () => {
      const product = Product.create({
        name: 'Laptop',
        description: 'Desc',
        price: 1000,
        stock: 5,
        imageUrl: 'https://img.com/img.jpg',
        categoryId: 1,
      });
      const saved = makeOrmRow();
      ormRepo.create.mockReturnValue(saved);
      ormRepo.save.mockResolvedValue(saved);
      ormRepo.findOne.mockResolvedValue(saved);

      const result = await repository.save(product);
      expect(result).toBeInstanceOf(Product);
      expect(ormRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('llama a delete con el id correcto', async () => {
      ormRepo.delete.mockResolvedValue({ affected: 1 });
      await repository.delete(validUUID);
      expect(ormRepo.delete).toHaveBeenCalledWith(validUUID);
    });
  });

  describe('update()', () => {
    it('actualiza los campos y retorna el producto rehidratado', async () => {
      const product = Product.reconstitute({
        id: validUUID,
        name: 'Laptop Actualizado',
        description: 'Desc',
        price: 1500,
        stock: 3,
        imageUrl: 'https://img.com/img.jpg',
        category: { id: 1 },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const updated = makeOrmRow({ name: 'Laptop Actualizado' });
      ormRepo.update.mockResolvedValue({ affected: 1 });
      ormRepo.findOne.mockResolvedValue(updated);

      const result = await repository.update(product);
      expect(ormRepo.update).toHaveBeenCalledWith(validUUID, expect.objectContaining({
        name: 'Laptop Actualizado',
        price: 1500,
      }));
      expect(result).toBeInstanceOf(Product);
    });
  });
});
