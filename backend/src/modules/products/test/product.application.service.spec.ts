import { ProductApplicationService } from '../application/product.application.service';
import { IProductRepository } from '../domain/ports/product.repository.port';
import { Product } from '../domain/entities/product.entity';
import { Err, Ok } from 'src/shared/result/result';
import { ProductNotFoundError } from '../domain/errors/product.errors';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const makeProduct = (overrides: Partial<Parameters<typeof Product.reconstitute>[0]> = {}) =>
  Product.reconstitute({
    id: validUUID,
    name: 'Laptop',
    description: 'Desc',
    price: 1000,
    stock: 5,
    imageUrl: 'https://img.com/img.jpg',
    category: { id: 1, name: 'Electrónica', slug: 'electronica' },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const mockRepo = (): jest.Mocked<IProductRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ProductApplicationService', () => {
  let service: ProductApplicationService;
  let repo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    repo = mockRepo();
    service = new ProductApplicationService(repo);
  });

  describe('getAll()', () => {
    it('delega al repositorio y retorna PaginationResult', async () => {
      const paginationResult = {
        items: [makeProduct()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        nextPage: null,
        previousPage: null,
      };
      repo.findAll.mockResolvedValue(paginationResult);

      const result = await service.getAll({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById()', () => {
    it('retorna Ok(product) cuando existe', async () => {
      const product = makeProduct();
      repo.findById.mockResolvedValue(product);

      const result = await service.getById(validUUID);
      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<Product>).value).toBe(product);
    });

    it('retorna Err(ProductNotFoundError) cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getById(validUUID);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<ProductNotFoundError>).error).toBeInstanceOf(ProductNotFoundError);
      expect((result as Err<ProductNotFoundError>).error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('create()', () => {
    it('crea y retorna el producto persistido', async () => {
      const saved = makeProduct();
      repo.save.mockResolvedValue(saved);

      const result = await service.create({
        name: 'Laptop',
        description: 'Desc',
        price: 1000,
        stock: 5,
        imageUrl: 'https://img.com/img.jpg',
        categoryId: 1,
      });

      expect(result).toBe(saved);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update()', () => {
    it('retorna Err(NotFound) si no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.update(validUUID, { name: 'Nuevo' });
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<ProductNotFoundError>).error).toBeInstanceOf(ProductNotFoundError);
    });

    it('actualiza campos y retorna Ok(product)', async () => {
      const original = makeProduct();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue({ ...original, name: 'Actualizado' } as Product);

      const result = await service.update(validUUID, { name: 'Actualizado', price: 1500 });
      expect(result).toBeInstanceOf(Ok);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('no modifica campos que no vienen en el dto', async () => {
      const original = makeProduct({ stock: 10 });
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      await service.update(validUUID, { name: 'Solo nombre' });
      expect(original.stock).toBe(10);
    });

    it('modifica description cuando viene en el dto', async () => {
      const original = makeProduct();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      await service.update(validUUID, { description: 'Nueva desc' });
      expect(original.description).toBe('Nueva desc');
    });

    it('modifica stock cuando viene en el dto', async () => {
      const original = makeProduct();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      await service.update(validUUID, { stock: 99 });
      expect(original.stock).toBe(99);
    });

    it('modifica images cuando viene en el dto', async () => {
      const original = makeProduct();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      await service.update(validUUID, { images: ['https://new.img/1.jpg'] });
      expect(original.images).toEqual(['https://new.img/1.jpg']);
    });

    it('modifica categoryId cuando viene en el dto', async () => {
      const original = makeProduct();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      await service.update(validUUID, { categoryId: 5 });
      expect(original.category.id).toBe(5);
    });
  });

  describe('delete()', () => {
    it('retorna Ok(undefined) cuando existe', async () => {
      repo.findById.mockResolvedValue(makeProduct());
      repo.delete.mockResolvedValue(undefined);

      const result = await service.delete(validUUID);
      expect(result).toBeInstanceOf(Ok);
      expect(repo.delete).toHaveBeenCalledWith(validUUID);
    });

    it('retorna Err(NotFound) si no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.delete(validUUID);
      expect(result).toBeInstanceOf(Err);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
