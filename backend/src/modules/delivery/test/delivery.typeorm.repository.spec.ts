import { DeliveryTypeOrmRepository } from '../infrastructure/persistence/typeorm/repository/delivery.typeorm.repository';
import { DeliveryOrmEntity } from '../infrastructure/persistence/typeorm/schema/delivery.orm-entity';
import { Delivery } from '../domain/entities/delivery.entity';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeOrmRow = (overrides: Partial<DeliveryOrmEntity> = {}): DeliveryOrmEntity => ({
  id: VALID_UUID,
  customerId: VALID_UUID,
  address: 'Calle 123 # 45-67',
  city: 'Bogotá',
  country: 'CO',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  customer: null as any,
  ...overrides,
});

const mockTypeOrmRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('DeliveryTypeOrmRepository', () => {
  let repository: DeliveryTypeOrmRepository;
  let ormRepo: ReturnType<typeof mockTypeOrmRepo>;

  beforeEach(() => {
    ormRepo = mockTypeOrmRepo();
    repository = new DeliveryTypeOrmRepository(ormRepo as any);
  });

  describe('toDomain — mapeo ORM → dominio', () => {
    it('mapea correctamente a Delivery de dominio', async () => {
      ormRepo.find.mockResolvedValue([makeOrmRow()]);
      const [delivery] = await repository.findAll();

      expect(delivery).toBeInstanceOf(Delivery);
      expect(delivery.id).toBe(VALID_UUID);
      expect(delivery.customerId).toBe(VALID_UUID);
      expect(delivery.address).toBe('Calle 123 # 45-67');
      expect(delivery.city).toBe('Bogotá');
      expect(delivery.country).toBe('CO');
    });

    it('preserva fechas originales de la DB', async () => {
      const createdAt = new Date('2023-05-10');
      ormRepo.find.mockResolvedValue([makeOrmRow({ createdAt })]);
      const [delivery] = await repository.findAll();
      expect(delivery.createdAt).toEqual(createdAt);
    });

    it('usa customerId de columna directa (sin JOIN)', async () => {
      ormRepo.find.mockResolvedValue([makeOrmRow({ customerId: VALID_UUID, customer: undefined as any })]);
      const [delivery] = await repository.findAll();
      expect(delivery.customerId).toBe(VALID_UUID);
    });
  });

  describe('findById()', () => {
    it('retorna Delivery cuando existe', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findById(VALID_UUID);
      expect(result).toBeInstanceOf(Delivery);
    });

    it('retorna null si no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findById('no-existe')).toBeNull();
    });
  });

  describe('findByCustomerId()', () => {
    it('retorna la delivery del customer', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      const result = await repository.findByCustomerId(VALID_UUID);
      expect(result).toBeInstanceOf(Delivery);
      expect(ormRepo.findOne).toHaveBeenCalledWith({
        where: { customer: { id: VALID_UUID } },
      });
    });

    it('retorna null si el customer no tiene delivery', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findByCustomerId(VALID_UUID)).toBeNull();
    });
  });

  describe('findLatestByCustomerId()', () => {
    it('ordena por createdAt DESC', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());
      await repository.findLatestByCustomerId(VALID_UUID);
      expect(ormRepo.findOne).toHaveBeenCalledWith({
        where: { customer: { id: VALID_UUID } },
        order: { createdAt: 'DESC' },
      });
    });

    it('retorna null si no hay deliveries', async () => {
      ormRepo.findOne.mockResolvedValue(null);
      expect(await repository.findLatestByCustomerId(VALID_UUID)).toBeNull();
    });
  });

  describe('save()', () => {
    it('persiste y retorna Delivery de dominio', async () => {
      const delivery = Delivery.create({
        customerId: VALID_UUID,
        address: 'Carrera 7',
        city: 'Cali',
        country: 'CO',
      });
      const saved = makeOrmRow({ address: 'Carrera 7', city: 'Cali' });
      ormRepo.create.mockReturnValue(saved);
      ormRepo.save.mockResolvedValue(saved);

      const result = await repository.save(delivery);
      expect(result).toBeInstanceOf(Delivery);
      expect(ormRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
