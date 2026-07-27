import { DeliveryApplicationService } from '../application/delivery.application.service';
import { IDeliveryRepository } from '../domain/ports/delivery.repository.port';
import { Delivery } from '../domain/entities/delivery.entity';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeDelivery = (overrides: Partial<Parameters<typeof Delivery.reconstitute>[0]> = {}) =>
  Delivery.reconstitute({
    id: VALID_UUID,
    customerId: VALID_UUID,
    address: 'Calle 123 # 45-67',
    city: 'Bogotá',
    country: 'CO',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const mockRepo = (): jest.Mocked<IDeliveryRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByCustomerId: jest.fn(),
  findLatestByCustomerId: jest.fn(),
  findAll: jest.fn(),
});

describe('DeliveryApplicationService', () => {
  let service: DeliveryApplicationService;
  let repo: jest.Mocked<IDeliveryRepository>;

  beforeEach(() => {
    repo = mockRepo();
    service = new DeliveryApplicationService(repo);
  });

  describe('getById()', () => {
    it('retorna la delivery cuando existe', async () => {
      repo.findById.mockResolvedValue(makeDelivery());
      const result = await service.getById(VALID_UUID);
      expect(result).toBeInstanceOf(Delivery);
      expect(repo.findById).toHaveBeenCalledWith(VALID_UUID);
    });

    it('retorna null si no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.getById('no-existe');
      expect(result).toBeNull();
    });
  });

  describe('getByCustomerId()', () => {
    it('retorna la delivery del customer', async () => {
      repo.findByCustomerId.mockResolvedValue(makeDelivery());
      const result = await service.getByCustomerId(VALID_UUID);
      expect(result).toBeInstanceOf(Delivery);
      expect(repo.findByCustomerId).toHaveBeenCalledWith(VALID_UUID);
    });

    it('retorna null si el customer no tiene delivery', async () => {
      repo.findByCustomerId.mockResolvedValue(null);
      const result = await service.getByCustomerId(VALID_UUID);
      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    const dto = {
      customerId: VALID_UUID,
      address: '  Calle 123 # 45-67  ',
      city: '  Bogotá  ',
      country: '  CO  ',
    };

    it('guarda y retorna la delivery persistida', async () => {
      const saved = makeDelivery();
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(result).toBeInstanceOf(Delivery);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('aplica trim a address, city y country antes de guardar', async () => {
      repo.save.mockResolvedValue(makeDelivery());
      await service.create(dto);

      const savedDelivery = repo.save.mock.calls[0][0] as Delivery;
      expect(savedDelivery.address).toBe('Calle 123 # 45-67');
      expect(savedDelivery.city).toBe('Bogotá');
      expect(savedDelivery.country).toBe('CO');
    });
  });
});
