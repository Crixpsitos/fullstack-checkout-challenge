import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CategoryController } from '../infrastructure/http/category.controller';
import { CategoryApplicationService } from '../application/category.application.service';
import { ok, err } from '../../../shared/result/result';
import {
  CategoryNotFoundError,
  CategorySlugConflictError,
} from '../domain/errors/category.errors';
import { Category } from '../domain/entities/category.entity';

const makeCategory = () =>
  Category.reconstitute({
    id: 1,
    name: 'Electrónica',
    slug: 'electronica',
    description: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryApplicationService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CategoryController);
    service = module.get(CategoryApplicationService);
  });

  describe('findAll()', () => {
    it('retorna array de CategoryResponseDto', async () => {
      service.getAll.mockResolvedValue([makeCategory()]);

      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 1, name: 'Electrónica', slug: 'electronica' });
    });

    it('retorna array vacío', async () => {
      service.getAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('retorna CategoryResponseDto cuando existe', async () => {
      service.getById.mockResolvedValue(ok(makeCategory()));

      const result = await controller.findOne(1);
      expect(result).toMatchObject({ id: 1, slug: 'electronica' });
    });

    it('lanza NotFoundException con code cuando no existe', async () => {
      service.getById.mockResolvedValue(err(new CategoryNotFoundError(99)));

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(99)).rejects.toMatchObject({
        response: { code: 'CATEGORY_NOT_FOUND', statusCode: HttpStatus.NOT_FOUND },
      });
    });
  });

  describe('create()', () => {
    const dto = { name: 'Libros', slug: 'libros', description: 'Desc', isActive: true };

    it('retorna CategoryResponseDto al crear', async () => {
      service.create.mockResolvedValue(ok(makeCategory()));
      const result = await controller.create(dto);
      expect(result).toMatchObject({ id: 1 });
    });

    it('lanza ConflictException con code si el slug existe', async () => {
      service.create.mockResolvedValue(err(new CategorySlugConflictError('libros')));

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
      await expect(controller.create(dto)).rejects.toMatchObject({
        response: { code: 'CATEGORY_SLUG_CONFLICT', statusCode: HttpStatus.CONFLICT },
      });
    });
  });

  describe('update()', () => {
    it('retorna CategoryResponseDto al actualizar', async () => {
      service.update.mockResolvedValue(ok(makeCategory()));
      const result = await controller.update(1, { name: 'Nuevo' });
      expect(result).toMatchObject({ id: 1 });
    });

    it('lanza NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(err(new CategoryNotFoundError(99)));
      await expect(controller.update(99, {})).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si slug ya existe', async () => {
      service.update.mockResolvedValue(err(new CategorySlugConflictError('ropa')));
      await expect(controller.update(1, { slug: 'ropa' })).rejects.toThrow(ConflictException);
    });
  });

  describe('delete()', () => {
    it('completa sin error cuando existe', async () => {
      service.delete.mockResolvedValue(ok(undefined));
      await expect(controller.delete(1)).resolves.toBeUndefined();
    });

    it('lanza NotFoundException si no existe', async () => {
      service.delete.mockResolvedValue(err(new CategoryNotFoundError(99)));
      await expect(controller.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
