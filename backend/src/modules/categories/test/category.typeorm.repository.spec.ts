import { CategoryTypeOrmRepository } from '../infrastructure/persistence/typeorm/repository/category.typeorm.repository';
import { CategoryOrmEntity } from '../infrastructure/persistence/typeorm/schema/category.orm-entity';
import { Category } from '../domain/entities/category.entity';

const makeOrmRow = (overrides: Partial<CategoryOrmEntity> = {}): CategoryOrmEntity => ({
  id: 1,
  name: 'Electrónica',
  slug: 'electronica',
  description: 'Desc',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  products: [],
  ...overrides,
});

const mockTypeOrmRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CategoryTypeOrmRepository', () => {
  let repository: CategoryTypeOrmRepository;
  let ormRepo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(() => {
    ormRepo = mockTypeOrmRepo();
    repository = new CategoryTypeOrmRepository(ormRepo as any);
  });

  describe('toDomain (indirectamente via findAll)', () => {
    it('mapea correctamente un ORM entity a un Category de dominio', async () => {
      const row = makeOrmRow();
      ormRepo.find.mockResolvedValue([row]);

      const [category] = await repository.findAll();

      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBe(1);
      expect(category.name).toBe('Electrónica');
      expect(category.slug).toBe('electronica');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toEqual(new Date('2024-01-01'));
      expect(category.updatedAt).toEqual(new Date('2024-06-01'));
    });

    it('preserva las fechas originales de la DB (no genera fechas nuevas)', async () => {
      const createdAt = new Date('2023-05-10');
      const row = makeOrmRow({ createdAt });
      ormRepo.find.mockResolvedValue([row]);

      const [category] = await repository.findAll();
      expect(category.createdAt).toEqual(createdAt);
    });

    it('retorna array vacío cuando no hay filas', async () => {
      ormRepo.find.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById()', () => {
    it('retorna null si no encuentra la fila', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      const result = await repository.findById(99);
      expect(result).toBeNull();
    });

    it('retorna Category cuando encuentra la fila', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findById(1);
      expect(result).toBeInstanceOf(Category);
    });
  });

  describe('save()', () => {
    it('persiste y retorna el dominio mapeado', async () => {
      const category = Category.create({
        name: 'Libros',
        slug: 'libros',
        description: null,
      });
      const saved = makeOrmRow({ slug: 'libros' });
      ormRepo.create.mockReturnValue(saved);
      ormRepo.save.mockResolvedValue(saved);

      const result = await repository.save(category);
      expect(result).toBeInstanceOf(Category);
      expect(ormRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('llama a delete con el id correcto', async () => {
      ormRepo.delete.mockResolvedValue({ affected: 1 });
      await repository.delete(1);
      expect(ormRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
