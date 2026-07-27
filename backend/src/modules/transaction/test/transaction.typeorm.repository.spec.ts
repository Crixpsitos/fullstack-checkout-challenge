import { TransactionTypeOrmRepository } from '../infrastructure/persistence/typeorm/repository/transaction.typeorm.repository';
import { TransactionOrmEntity } from '../infrastructure/persistence/typeorm/schema/transaction.orm-entity';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionStatus } from '../domain/entities/transaction-status.vo';

const makeOrmRow = (
  overrides: Partial<TransactionOrmEntity> = {},
): TransactionOrmEntity => ({
  id: 'tx-uuid-001',
  idempotencyKey: 'idem-key-abc',
  reference: 'REF-00001',
  gatewayId: 'gw-ext-001',
  status: TransactionStatus.APPROVED,
  amountInCents: 500_000,
  product: { id: 'prod-uuid-001' } as any,
  customer: { id: 'cust-uuid-001' } as any,
  delivery: { id: 'deliv-uuid-001' } as any,
  cardLastFour: '4242',
  cardBrand: 'VISA',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  ...overrides,
});

const makeDomainTx = (status = TransactionStatus.PENDING) =>
  Transaction.reconstitute({
    id: 'tx-uuid-001',
    idempotencyKey: 'idem-key-abc',
    reference: 'REF-00001',
    gatewayId: null,
    status,
    amountInCents: 500_000,
    productId: 'prod-uuid-001',
    customerId: 'cust-uuid-001',
    deliveryId: 'deliv-uuid-001',
    cardLastFour: null,
    cardBrand: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

const mockOrmRepo = () => ({
  insert: jest.fn(),
  save: jest.fn(),
  create: jest.fn().mockImplementation((data: unknown) => data),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
});

describe('TransactionTypeOrmRepository', () => {
  let repository: TransactionTypeOrmRepository;
  let ormRepo: ReturnType<typeof mockOrmRepo>;

  beforeEach(() => {
    ormRepo = mockOrmRepo();
    repository = new TransactionTypeOrmRepository(ormRepo as any);
  });

  describe('create()', () => {
    it('llama insert y luego findOneOrFail para retornar la entidad completa', async () => {
      const row = makeOrmRow({ gatewayId: null, cardLastFour: null, cardBrand: null, status: TransactionStatus.PENDING });
      ormRepo.findOneOrFail.mockResolvedValue(row);

      const tx = makeDomainTx();
      const result = await repository.create(tx);

      expect(ormRepo.insert).toHaveBeenCalledTimes(1);
      expect(ormRepo.findOneOrFail).toHaveBeenCalledWith({
        where: { id: tx.id },
        relations: { product: true, customer: true, delivery: true },
      });
      expect(result).toBeInstanceOf(Transaction);
    });

    it('retorna la transacción con los datos de la DB (toDomain correcto)', async () => {
      const row = makeOrmRow({ status: TransactionStatus.PENDING, gatewayId: null });
      ormRepo.findOneOrFail.mockResolvedValue(row);

      const result = await repository.create(makeDomainTx());

      expect(result.id).toBe('tx-uuid-001');
      expect(result.reference).toBe('REF-00001');
      expect(result.amountInCents).toBe(500_000);
      expect(result.productId).toBe('prod-uuid-001');
      expect(result.customerId).toBe('cust-uuid-001');
      expect(result.deliveryId).toBe('deliv-uuid-001');
    });
  });

  describe('update()', () => {
    it('llama repo.save con los datos de la transacción y retorna domain entity', async () => {
      const row = makeOrmRow({ status: TransactionStatus.APPROVED, gatewayId: 'gw-001', cardLastFour: '4242', cardBrand: 'VISA' });
      ormRepo.save.mockResolvedValue(row);

      const tx = makeDomainTx(TransactionStatus.APPROVED);
      const result = await repository.update(tx);

      expect(ormRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Transaction);
      expect(result.status).toBe(TransactionStatus.APPROVED);
    });

    it('mapea gatewayId, cardLastFour y cardBrand desde la respuesta de save', async () => {
      const row = makeOrmRow({ gatewayId: 'gw-ext-999', cardLastFour: '1234', cardBrand: 'MASTERCARD', status: TransactionStatus.APPROVED });
      ormRepo.save.mockResolvedValue(row);

      const result = await repository.update(makeDomainTx());

      expect(result.gatewayId).toBe('gw-ext-999');
      expect(result.cardLastFour).toBe('1234');
      expect(result.cardBrand).toBe('MASTERCARD');
    });
  });

  describe('findById()', () => {
    it('retorna Transaction de dominio cuando existe la fila', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow());

      const result = await repository.findById('tx-uuid-001');

      expect(result).toBeInstanceOf(Transaction);
      expect(result!.id).toBe('tx-uuid-001');
      expect(ormRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-001' },
        relations: { product: true, customer: true, delivery: true },
      });
    });

    it('retorna null cuando no existe la fila', async () => {
      ormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById('no-existe');

      expect(result).toBeNull();
    });

    it('preserva las fechas createdAt y updatedAt de la DB', async () => {
      const createdAt = new Date('2026-03-15');
      const updatedAt = new Date('2026-03-16');
      ormRepo.findOne.mockResolvedValue(makeOrmRow({ createdAt, updatedAt }));

      const result = await repository.findById('tx-uuid-001');

      expect(result!.createdAt).toEqual(createdAt);
      expect(result!.updatedAt).toEqual(updatedAt);
    });
  });

  describe('findByIdempotencyKey()', () => {
    it('retorna Transaction de dominio cuando la clave existe', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow({ idempotencyKey: 'idem-test-001' }));

      const result = await repository.findByIdempotencyKey('idem-test-001');

      expect(result).toBeInstanceOf(Transaction);
      expect(ormRepo.findOne).toHaveBeenCalledWith({
        where: { idempotencyKey: 'idem-test-001' },
        relations: { product: true, customer: true, delivery: true },
      });
    });

    it('retorna null cuando la clave no existe', async () => {
      ormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findByIdempotencyKey('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('toDomain — mapeo completo', () => {
    it('mapea todos los campos del ORM entity al domain entity', async () => {
      const row = makeOrmRow({
        id: 'tx-map-001',
        status: TransactionStatus.DECLINED,
        gatewayId: 'gw-map-001',
        amountInCents: 250_000,
        cardLastFour: '9999',
        cardBrand: 'AMEX',
      });
      ormRepo.findOne.mockResolvedValue(row);

      const result = (await repository.findById('tx-map-001'))!;

      expect(result.id).toBe('tx-map-001');
      expect(result.status).toBe(TransactionStatus.DECLINED);
      expect(result.gatewayId).toBe('gw-map-001');
      expect(result.amountInCents).toBe(250_000);
      expect(result.cardLastFour).toBe('9999');
      expect(result.cardBrand).toBe('AMEX');
      expect(result.productId).toBe('prod-uuid-001');
      expect(result.customerId).toBe('cust-uuid-001');
      expect(result.deliveryId).toBe('deliv-uuid-001');
    });

    it('acepta gatewayId null (transacción no enviada aún)', async () => {
      ormRepo.findOne.mockResolvedValue(makeOrmRow({ gatewayId: null, status: TransactionStatus.PENDING }));

      const result = (await repository.findById('tx-uuid-001'))!;

      expect(result.gatewayId).toBeNull();
      expect(result.status).toBe(TransactionStatus.PENDING);
    });
  });
});
