import { TransactionApplicationService } from '../application/transaction.application.service';
import { type ITransactionRepositoryPort } from '../domain/ports/transaction.repository.port';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionStatus } from '../domain/entities/transaction-status.vo';

const makeTransaction = (
  overrides: Partial<Parameters<typeof Transaction.reconstitute>[0]> = {},
) =>
  Transaction.reconstitute({
    id: 'tx-id-001',
    idempotencyKey: 'idem-key-abc',
    reference: 'REF-00001',
    gatewayId: 'gw-123',
    status: TransactionStatus.APPROVED,
    amountInCents: 500_000,
    productId: 'prod-id-001',
    customerId: 'cust-id-001',
    deliveryId: 'deliv-id-001',
    cardLastFour: '4242',
    cardBrand: 'VISA',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

const mockRepo = (): jest.Mocked<ITransactionRepositoryPort> => ({
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByIdempotencyKey: jest.fn(),
});

describe('TransactionApplicationService', () => {
  let service: TransactionApplicationService;
  let repo: jest.Mocked<ITransactionRepositoryPort>;

  beforeEach(() => {
    repo = mockRepo();
    service = new TransactionApplicationService(repo);
  });

  describe('getById()', () => {
    it('retorna la transacción cuando existe', async () => {
      const tx = makeTransaction();
      repo.findById.mockResolvedValue(tx);

      const result = await service.getById('tx-id-001');

      expect(result).toBe(tx);
      expect(repo.findById).toHaveBeenCalledWith('tx-id-001');
    });

    it('retorna null cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getById('no-existe');

      expect(result).toBeNull();
    });

    it('delega exactamente el id recibido al repositorio', async () => {
      repo.findById.mockResolvedValue(null);
      await service.getById('uuid-123-abc');
      expect(repo.findById).toHaveBeenCalledWith('uuid-123-abc');
    });
  });

  describe('getByIdempotencyKey()', () => {
    it('retorna la transacción cuando la clave existe', async () => {
      const tx = makeTransaction({ idempotencyKey: 'idem-test-001' });
      repo.findByIdempotencyKey.mockResolvedValue(tx);

      const result = await service.getByIdempotencyKey('idem-test-001');

      expect(result).toBe(tx);
      expect(repo.findByIdempotencyKey).toHaveBeenCalledWith('idem-test-001');
    });

    it('retorna null cuando la clave no existe', async () => {
      repo.findByIdempotencyKey.mockResolvedValue(null);

      const result = await service.getByIdempotencyKey('no-existe');

      expect(result).toBeNull();
    });

    it('delega exactamente la clave recibida al repositorio', async () => {
      repo.findByIdempotencyKey.mockResolvedValue(null);
      await service.getByIdempotencyKey('mi-clave-especial');
      expect(repo.findByIdempotencyKey).toHaveBeenCalledWith('mi-clave-especial');
    });
  });
});
