import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CustomerController } from '../infrastructure/http/customer.controller';
import { CustomerApplicationService } from '../application/customer.application.service';
import { ok, err } from '../../../shared/result/result';
import {
  CustomerNotFoundError,
  CustomerInvalidPhoneError,
} from '../domain/errors/customer.errors';
import { Customer } from '../domain/entities/customer.entity';

const make = () =>
  Customer.reconstitute({
    id: 'uuid-1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '3001234567',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

const mockRes = () => ({ status: jest.fn().mockReturnThis() } as any);

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: jest.Mocked<CustomerApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerApplicationService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            getByEmail: jest.fn(),
            createOrUpdate: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CustomerController);
    service = module.get(CustomerApplicationService);
  });

  describe('findByEmail()', () => {
    it('retorna CustomerResponseDto cuando existe el customer', async () => {
      service.getByEmail.mockResolvedValue({ customer: make(), latestDelivery: null });
      const result = await controller.findByEmail('juan@email.com');
      expect(result).toMatchObject({ email: 'juan@email.com' });
    });

    it('retorna null cuando el email no corresponde a ningún customer', async () => {
      service.getByEmail.mockResolvedValue(null);
      const result = await controller.findByEmail('no@existe.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('retorna array de CustomerResponseDto', async () => {
      service.getAll.mockResolvedValue([make()]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'uuid-1', email: 'juan@email.com' });
    });
  });

  describe('findOne()', () => {
    it('retorna CustomerResponseDto cuando existe', async () => {
      service.getById.mockResolvedValue(ok({ customer: make(), latestDelivery: null }));
      const result = await controller.findOne('uuid-1');
      expect(result).toMatchObject({ id: 'uuid-1' });
    });

    it('lanza NotFoundException con code cuando no existe', async () => {
      service.getById.mockResolvedValue(err(new CustomerNotFoundError('uuid-x')));
      await expect(controller.findOne('uuid-x')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('uuid-x')).rejects.toMatchObject({
        response: { code: 'CUSTOMER_NOT_FOUND', statusCode: HttpStatus.NOT_FOUND },
      });
    });
  });

  describe('createOrUpdate() — ROP + status codes', () => {
    const dto = { name: 'Juan Pérez', email: 'juan@email.com', phone: '3001234567' };

    it('responde 201 cuando se crea nuevo customer', async () => {
      service.createOrUpdate.mockResolvedValue(ok({ customer: make(), created: true }));
      const res = mockRes();
      await controller.createOrUpdate(dto, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('responde 200 cuando se actualiza customer existente', async () => {
      service.createOrUpdate.mockResolvedValue(ok({ customer: make(), created: false }));
      const res = mockRes();
      await controller.createOrUpdate(dto, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('lanza ConflictException con code cuando teléfono es inválido', async () => {
      service.createOrUpdate.mockResolvedValue(err(new CustomerInvalidPhoneError('3001234567')));
      const res = mockRes();
      await expect(controller.createOrUpdate(dto, res)).rejects.toThrow(ConflictException);
      await expect(controller.createOrUpdate(dto, res)).rejects.toMatchObject({
        response: { code: 'CUSTOMER_INVALID_PHONE', statusCode: HttpStatus.CONFLICT },
      });
    });
  });
});
