import { CustomerApplicationService } from '../application/customer.application.service';
import { ICustomerRepository } from '../domain/ports/customer.repository.port';
import { IDeliveryRepository } from '../../delivery/domain/ports/delivery.repository.port';
import { Customer } from '../domain/entities/customer.entity';
import { Delivery } from '../../delivery/domain/entities/delivery.entity';
import { Err, Ok } from 'src/shared/result/result';
import {
  CustomerNotFoundError,
  CustomerInvalidEmailError,
  CustomerInvalidPhoneError,
} from '../domain/errors/customer.errors';

const make = (overrides: Partial<Parameters<typeof Customer.reconstitute>[0]> = {}) =>
  Customer.reconstitute({
    id: 'uuid-1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '3001234567',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const mockRepo = (): jest.Mocked<ICustomerRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByPhone: jest.fn(),
  save: jest.fn(),
});

const mockDeliveryRepo = (): jest.Mocked<IDeliveryRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByCustomerId: jest.fn(),
  findLatestByCustomerId: jest.fn(),
  findAll: jest.fn(),
});

describe('CustomerApplicationService', () => {
  let service: CustomerApplicationService;
  let repo: jest.Mocked<ICustomerRepository>;
  let deliveryRepo: jest.Mocked<IDeliveryRepository>;

  beforeEach(() => {
    repo = mockRepo();
    deliveryRepo = mockDeliveryRepo();
    service = new CustomerApplicationService(repo, deliveryRepo);
  });

  // ── getAll ────────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('retorna lista de customers', async () => {
      repo.findAll.mockResolvedValue([make(), make({ id: 'uuid-2', email: 'ana@email.com' })]);
      const result = await service.getAll();
      expect(result).toHaveLength(2);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('retorna Ok({ customer, latestDelivery }) cuando existe', async () => {
      const customer = make();
      repo.findById.mockResolvedValue(customer);
      deliveryRepo.findLatestByCustomerId.mockResolvedValue(null);
      const result = await service.getById('uuid-1');
      expect(result).toBeInstanceOf(Ok);
      const value = (result as Ok<{ customer: Customer; latestDelivery: Delivery | null }>).value;
      expect(value.customer).toBe(customer);
      expect(value.latestDelivery).toBeNull();
    });

    it('retorna Err(CustomerNotFoundError) cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.getById('no-existe');
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CustomerNotFoundError>).error).toBeInstanceOf(CustomerNotFoundError);
      expect((result as Err<CustomerNotFoundError>).error.code).toBe('CUSTOMER_NOT_FOUND');
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    const dto = { name: 'Ana García', email: 'ana@email.com', phone: '3109876543' };

    it('retorna Ok(customer) cuando email y teléfono son únicos', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(null);
      repo.save.mockResolvedValue(make({ email: dto.email }));
      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Ok);
    });

    it('retorna Err(CustomerInvalidEmailError) si el email ya existe', async () => {
      repo.findByEmail.mockResolvedValue(make());
      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CustomerInvalidEmailError>).error).toBeInstanceOf(CustomerInvalidEmailError);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('retorna Err(CustomerInvalidPhoneError) si el teléfono ya existe', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(make());
      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CustomerInvalidPhoneError>).error).toBeInstanceOf(CustomerInvalidPhoneError);
    });
  });

  // ── createOrUpdate ────────────────────────────────────────────────────────
  describe('createOrUpdate() — ROP upsert por email', () => {
    const dto = { name: 'Juan Actualizado', email: 'juan@email.com', phone: '3001234567' };

    it('crea nuevo customer cuando el email no existe — created: true', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(null);
      const saved = make({ name: dto.name });
      repo.save.mockResolvedValue(saved);

      const result = await service.createOrUpdate(dto);
      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<{ customer: Customer; created: boolean }>).value.created).toBe(true);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('actualiza customer existente cuando el email ya existe — created: false', async () => {
      const existing = make();
      repo.findByEmail.mockResolvedValue(existing);
      repo.findByPhone.mockResolvedValue(null);
      repo.save.mockResolvedValue({ ...existing, name: 'Juan Actualizado' } as Customer);

      const result = await service.createOrUpdate(dto);
      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<{ customer: Customer; created: boolean }>).value.created).toBe(false);
    });

    it('retorna Err si el nuevo teléfono pertenece a otro customer', async () => {
      const existing = make();
      const otherCustomer = make({ id: 'uuid-otro', phone: '3119999999' });
      repo.findByEmail.mockResolvedValue(existing);
      repo.findByPhone.mockResolvedValue(otherCustomer);

      const result = await service.createOrUpdate({ ...dto, phone: '3119999999' });
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CustomerInvalidPhoneError>).error).toBeInstanceOf(CustomerInvalidPhoneError);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('permite actualizar sin cambiar el teléfono propio', async () => {
      const existing = make();
      repo.findByEmail.mockResolvedValue(existing);
      // mismo teléfono → no busca por phone
      repo.save.mockResolvedValue(existing);

      const result = await service.createOrUpdate(dto); // mismo phone que existing
      expect(result).toBeInstanceOf(Ok);
      expect(repo.findByPhone).not.toHaveBeenCalled();
    });

    it('retorna Err si el teléfono ya existe al crear nuevo customer', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(make({ phone: dto.phone }));

      const result = await service.createOrUpdate(dto);
      expect(result).toBeInstanceOf(Err);
      expect((result as Err<CustomerInvalidPhoneError>).error.code).toBe('CUSTOMER_INVALID_PHONE');
    });
  });
});;
