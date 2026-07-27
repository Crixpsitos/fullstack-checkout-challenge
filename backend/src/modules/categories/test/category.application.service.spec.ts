import { CategoryApplicationService } from '../application/category.application.service';
import { ICategoryRepository } from '../domain/ports/category.repository.port';
import { Category } from '../domain/entities/category.entity';
import { Err, Ok } from 'src/shared/result/result';
import {
  CategoryNotFoundError,
  CategorySlugConflictError,
} from '../domain/errors/category.errors';

const makeCategory = (overrides: Partial<Parameters<typeof Category.reconstitute>[0]> = {}) =>
  Category.reconstitute({
    id: 1,
    name: 'Electrónica',
    slug: 'electronica',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const mockRepo = (): jest.Mocked<ICategoryRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CategoryApplicationService', () => {
  let service: CategoryApplicationService;
  let repo: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    repo = mockRepo();
    service = new CategoryApplicationService(repo);
  });

  describe('getAll()', () => {
    it('retorna lista de categorías', async () => {
      const categories = [makeCategory(), makeCategory({ id: 2, slug: 'ropa' })];
      repo.findAll.mockResolvedValue(categories);

      const result = await service.getAll();
      expect(result).toHaveLength(2);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });

    it('retorna array vacío si no hay categorías', async () => {
      repo.findAll.mockResolvedValue([]);
      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('retorna Ok(category) cuando existe', async () => {
      const category = makeCategory();
      repo.findById.mockResolvedValue(category);

      const result = await service.getById(1);
      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<Category>).value).toBe(category);
    });

    it('retorna Err(CategoryNotFoundError) cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getById(99);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CategoryNotFoundError>).error).toBeInstanceOf(CategoryNotFoundError);
      expect((result as Err<CategoryNotFoundError>).error.code).toBe('CATEGORY_NOT_FOUND');
    });
  });

  describe('create()', () => {
    const dto = { name: 'Libros', slug: 'libros', description: 'Descripción', isActive: true };

    it('retorna Ok(category) cuando el slug no existe', async () => {
      repo.findBySlug.mockResolvedValue(null);
      const saved = makeCategory({ slug: 'libros' });
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Ok);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('retorna Err(CategorySlugConflictError) si el slug ya existe', async () => {
      repo.findBySlug.mockResolvedValue(makeCategory({ slug: 'libros' }));

      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CategorySlugConflictError>).error).toBeInstanceOf(CategorySlugConflictError);
      expect((result as Err<CategorySlugConflictError>).error.code).toBe('CATEGORY_SLUG_CONFLICT');
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('retorna Err(NotFound) si la categoría no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.update(99, { name: 'Nuevo' });
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CategoryNotFoundError>).error).toBeInstanceOf(CategoryNotFoundError);
    });

    it('retorna Err(SlugConflict) si el nuevo slug ya pertenece a otra categoría', async () => {
      repo.findById.mockResolvedValue(makeCategory({ slug: 'electronica' }));
      repo.findBySlug.mockResolvedValue(makeCategory({ id: 2, slug: 'ropa' }));

      const result = await service.update(1, { slug: 'ropa' });
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CategorySlugConflictError>).error).toBeInstanceOf(CategorySlugConflictError);
    });

    it('actualiza y retorna Ok(category) correctamente', async () => {
      const original = makeCategory();
      repo.findById.mockResolvedValue(original);
      repo.findBySlug.mockResolvedValue(null);
      repo.save.mockResolvedValue({ ...original, name: 'Actualizado' } as Category);

      const result = await service.update(1, { name: 'Actualizado' });
      expect(result).toBeInstanceOf(Ok);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('actualiza sin verificar conflicto si el slug no cambia', async () => {
      const original = makeCategory({ slug: 'electronica' });
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      const result = await service.update(1, { name: 'Electrónica v2', slug: 'electronica' });
      expect(result).toBeInstanceOf(Ok);
      expect(repo.findBySlug).not.toHaveBeenCalled();
    });

    it('actualiza correctamente cuando no viene slug', async () => {
      const original = makeCategory();
      repo.findById.mockResolvedValue(original);
      repo.save.mockResolvedValue(original);

      const result = await service.update(1, { name: 'Solo nombre' });
      expect(result).toBeInstanceOf(Ok);
      expect(repo.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('retorna Ok(undefined) cuando la categoría existe', async () => {
      repo.findById.mockResolvedValue(makeCategory());
      repo.delete.mockResolvedValue(undefined);

      const result = await service.delete(1);
      expect(result).toBeInstanceOf(Ok);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('retorna Err(NotFound) si la categoría no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.delete(99);
      expect(result).toBeInstanceOf(Err);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
