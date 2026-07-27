import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ProductController } from '../infrastructure/http/product.controller';
import { ProductApplicationService } from '../application/product.application.service';
import { ok, err } from 'src/shared/result/result';
import { ProductNotFoundError } from '../domain/errors/product.errors';
import { Product } from '../domain/entities/product.entity';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const makeProduct = () =>
  Product.reconstitute({
    id: validUUID,
    name: 'Laptop',
    description: 'Desc',
    price: 1000,
    stock: 5,
    imageUrl: 'https://img.com/img.jpg',
    category: { id: 1, name: 'Electrónica', slug: 'electronica' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

const mockReq = () =>
  ({ protocol: 'http', get: () => 'localhost:3000', path: '/products' }) as any;

describe('ProductController', () => {
  let controller: ProductController;
  let service: jest.Mocked<ProductApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductApplicationService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'STORAGE_SERVICE',
          useValue: {
            saveMany: jest.fn(),
            deleteMany: jest.fn(),
            isLocalUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProductController);
    service = module.get(ProductApplicationService);
  });

  describe('findAll()', () => {
    it('retorna PaginatedResponseDto con items mapeados', async () => {
      service.getAll.mockResolvedValue({
        items: [makeProduct()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        nextPage: null,
        previousPage: null,
      });

      const result = await controller.findAll({ page: 1, limit: 10 }, mockReq());
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.nextPage).toBeNull();
    });

    it('retorna items vacíos con nextPage/previousPage null', async () => {
      service.getAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        nextPage: null,
        previousPage: null,
      });

      const result = await controller.findAll({ page: 1, limit: 10 }, mockReq());
      expect(result.items).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('retorna ProductResponseDto cuando existe', async () => {
      service.getById.mockResolvedValue(ok(makeProduct()));

      const result = await controller.findOne(validUUID);
      expect(result).toMatchObject({ id: validUUID, name: 'Laptop' });
    });

    it('lanza NotFoundException con code cuando no existe', async () => {
      service.getById.mockResolvedValue(err(new ProductNotFoundError(validUUID)));

      await expect(controller.findOne(validUUID)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(validUUID)).rejects.toMatchObject({
        response: { code: 'PRODUCT_NOT_FOUND', statusCode: HttpStatus.NOT_FOUND },
      });
    });
  });

  describe('create()', () => {
    const dto = {
      name: 'Laptop',
      description: 'Desc',
      price: 1000,
      stock: 5,
      imageUrls: ['https://img.com/img.jpg'],
      categoryId: 1,
    };

    it('retorna ProductResponseDto al crear', async () => {
      service.create.mockResolvedValue(makeProduct());
      const result = await controller.create(dto);
      expect(result).toMatchObject({ id: validUUID });
    });

    it('lanza BadRequestException cuando no hay imágenes ni archivos', async () => {
      const dtoSinImagenes = { ...dto, imageUrls: undefined };
      await expect(controller.create(dtoSinImagenes)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update()', () => {
    it('retorna ProductResponseDto al actualizar', async () => {
      service.update.mockResolvedValue(ok(makeProduct()));
      const result = await controller.update(validUUID, { name: 'Nuevo' });
      expect(result).toMatchObject({ id: validUUID });
    });

    it('lanza NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(err(new ProductNotFoundError(validUUID)));
      await expect(controller.update(validUUID, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('completa sin error cuando existe', async () => {
      service.delete.mockResolvedValue(ok(undefined));
      await expect(controller.delete(validUUID)).resolves.toBeUndefined();
    });

    it('lanza NotFoundException si no existe', async () => {
      service.delete.mockResolvedValue(err(new ProductNotFoundError(validUUID)));
      await expect(controller.delete(validUUID)).rejects.toThrow(NotFoundException);
    });
  });
});
