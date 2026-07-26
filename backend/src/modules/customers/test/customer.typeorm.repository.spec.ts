import { CustomerTypeOrmRepository } from '../infrastructure/persistence/typeorm/repository/customer.typeorm.repository';
import { CustomerOrmEntity } from '../infrastructure/persistence/typeorm/schema/customer.orm-entity';
import { Customer } from '../domain/entities/customer.entity';

const makeOrmRow = (overrides: Partial<CustomerOrmEntity> = {}): CustomerOrmEntity => ({
  id: 'uuid-1',
  name: 'Juan Pérez',
  email: 'juan@email.com',
  phone: '3001234567',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  ...overrides,
});

const mockTypeOrmRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CustomerTypeOrmRepository', () => {
  let repository: CustomerTypeOrmRepository;
  let ormRepo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(() => {
    ormRepo = mockTypeOrmRepo();
    repository = new CustomerTypeOrmRepository(ormRepo as any);
  });

  describe('toDomain — mapeo ORM → dominio', () => {
    it('findAll mapea correctamente a Customer de dominio', async () => {
      ormRepo.find.mockResolvedValue([makeOrmRow()]);
      const [customer] = await repository.findAll();
      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe('uuid-1');
      expect(customer.email).toBe('juan@email.com');
    });

    it('preserva las fechas originales de la DB', async () => {
      const createdAt = new Date('2023-01-15');
      ormRepo.find.mockResolvedValue([makeOrmRow({ createdAt })]);
      const [customer] = await repository.findAll();
      expect(customer.createdAt).toEqual(createdAt);
    });

    it('retorna array vacío cuando no hay filas', async () => {
      ormRepo.find.mockResolvedValue([]);
      expect(await repository.findAll()).toEqual([]);
    });
  });

  describe('findById()', () => {
    it('retorna Customer cuando existe', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findById('uuid-1');
      expect(result).toBeInstanceOf(Customer);
    });

    it('retorna null si no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findById('no-existe')).toBeNull();
    });
  });

  describe('findByEmail()', () => {
    it('retorna Customer cuando existe el email', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findByEmail('juan@email.com');
      expect(result).toBeInstanceOf(Customer);
      expect(ormRepo.findOne).toHaveBeenCalledWith({ where: { email: 'juan@email.com' } });
    });

    it('retorna null si el email no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findByEmail('noexiste@email.com')).toBeNull();
    });
  });

  describe('findByPhone()', () => {
    it('retorna Customer cuando existe el teléfono', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findByPhone('3001234567');
      expect(result).toBeInstanceOf(Customer);
      expect(ormRepo.findOne).toHaveBeenCalledWith({ where: { phone: '3001234567' } });
    });

    it('retorna null si el teléfono no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findByPhone('9999999999')).toBeNull();
    });
  });

  describe('save()', () => {
    it('persiste y retorna Customer de dominio', async () => {
      const customer = Customer.create({
        name: 'Ana García',
        email: 'ana@email.com',
        phone: '3109876543',
      });
      const saved = makeOrmRow({ email: 'ana@email.com' });
      ormRepo.create.mockReturnValue(saved);
      ormRepo.save.mockResolvedValue(saved);

      const result = await repository.save(customer);
      expect(result).toBeInstanceOf(Customer);
      expect(ormRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete()', () => {
    it('llama a delete con el id correcto', async () => {
      ormRepo.delete.mockResolvedValue({ affected: 1 });
      await repository.delete('uuid-1');
      expect(ormRepo.delete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
