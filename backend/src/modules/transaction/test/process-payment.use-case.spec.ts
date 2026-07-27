import { ProcessPaymentUseCase, type ProcessPaymentInput } from '../application/use-cases/process-payment.use-case';
import { type ITransactionRepositoryPort } from '../domain/ports/transaction.repository.port';
import { type PaymentGatewayPort } from '../domain/ports/payment-gateway.port';
import { type IProductRepository } from '../../products/domain/ports/product.repository.port';
import { type IDeliveryRepository } from '../../delivery/domain/ports/delivery.repository.port';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionStatus } from '../domain/entities/transaction-status.vo';
import { Product } from '../../products/domain/entities/product.entity';
import { Delivery } from '../../delivery/domain/entities/delivery.entity';
import { Ok, Err } from 'src/shared/result/result';
import { PaymentGatewayError, PaymentGatewayTimeoutError } from '../domain/errors/payment-gateway.errors';

const makeInput = (overrides: Partial<ProcessPaymentInput> = {}): ProcessPaymentInput => ({
  idempotencyKey: 'idem-uuid-abc-1234',
  reference: 'REF-ABCD1234',
  amountInCents: 500_000,
  quantity: 1,
  productId: 'prod-uuid-001',
  customerId: 'cust-uuid-001',
  cardToken: 'tok_test_abc123',
  acceptanceToken: 'acceptance_tok_xyz',
  customerEmail: 'test@example.com',
  customerName: 'Juan Pérez',
  delivery: { address: 'Calle 123 #45', city: 'Bogotá', country: 'CO' },
  ...overrides,
});

const makeProduct = (stock = 10) =>
  Product.reconstitute({
    id: 'prod-uuid-001',
    name: 'Producto Test',
    description: 'Descripción',
    price: 250_000,
    stock,
    images: [],
    category: { id: 1, name: 'Test' },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makeDelivery = () =>
  Delivery.reconstitute({
    id: 'deliv-uuid-001',
    customerId: 'cust-uuid-001',
    address: 'Calle 123 #45',
    city: 'Bogotá',
    country: 'CO',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makeSavedTransaction = (status = TransactionStatus.PENDING) =>
  Transaction.reconstitute({
    id: 'tx-uuid-001',
    idempotencyKey: 'idem-uuid-abc-1234',
    reference: 'REF-ABCD1234',
    gatewayId: null,
    status,
    amountInCents: 500_000,
    productId: 'prod-uuid-001',
    customerId: 'cust-uuid-001',
    deliveryId: 'deliv-uuid-001',
    cardLastFour: null,
    cardBrand: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const mockTxRepo = (): jest.Mocked<ITransactionRepositoryPort> => ({
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByIdempotencyKey: jest.fn(),
});

const mockGateway = (): jest.Mocked<PaymentGatewayPort> => ({
  createTransaction: jest.fn(),
  pollStatus: jest.fn(),
});

const mockProductRepo = (): jest.Mocked<IProductRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockDeliveryRepo = (): jest.Mocked<IDeliveryRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByCustomerId: jest.fn(),
  findLatestByCustomerId: jest.fn(),
  findAll: jest.fn(),
});

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let txRepo: jest.Mocked<ITransactionRepositoryPort>;
  let gateway: jest.Mocked<PaymentGatewayPort>;
  let productRepo: jest.Mocked<IProductRepository>;
  let deliveryRepo: jest.Mocked<IDeliveryRepository>;

  beforeEach(() => {
    txRepo = mockTxRepo();
    gateway = mockGateway();
    productRepo = mockProductRepo();
    deliveryRepo = mockDeliveryRepo();
    useCase = new ProcessPaymentUseCase(txRepo, gateway, productRepo, deliveryRepo);
  });

  describe('Idempotencia', () => {
    it('retorna Ok con la transacción existente si ya fue procesada', async () => {
      const existing = makeSavedTransaction(TransactionStatus.APPROVED);
      txRepo.findByIdempotencyKey.mockResolvedValue(existing);

      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<any>).value.transactionId).toBe(existing.id);
      expect(txRepo.create).not.toHaveBeenCalled();
      expect(gateway.createTransaction).not.toHaveBeenCalled();
    });

    it('retorna el status original de la transacción ya procesada', async () => {
      const existing = makeSavedTransaction(TransactionStatus.DECLINED);
      txRepo.findByIdempotencyKey.mockResolvedValue(existing);

      const result = await useCase.execute(makeInput()) as Ok<any>;

      expect(result.value.status).toBe(TransactionStatus.DECLINED);
    });
  });

  describe('Validaciones de producto', () => {
    beforeEach(() => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
    });

    it('retorna Err PRODUCT_NOT_FOUND si el producto no existe', async () => {
      productRepo.findById.mockResolvedValue(null);

      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Err);
      expect((result as Err<any>).error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('retorna Err OUT_OF_STOCK si no hay suficiente stock', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(0));

      const result = await useCase.execute(makeInput({ quantity: 1 }));

      expect(result).toBeInstanceOf(Err);
      expect((result as Err<any>).error.code).toBe('OUT_OF_STOCK');
    });

    it('retorna Err OUT_OF_STOCK cuando quantity supera el stock', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(2));

      const result = await useCase.execute(makeInput({ quantity: 5 }));

      expect(result).toBeInstanceOf(Err);
      expect((result as Err<any>).error.code).toBe('OUT_OF_STOCK');
    });

    it('continúa si el stock es exactamente igual a quantity', async () => {
      productRepo.findById.mockResolvedValue(makeProduct(3));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-1', cardLastFour: '4242', cardBrand: 'VISA' });
      gateway.pollStatus.mockResolvedValue('APPROVED');
      productRepo.save.mockResolvedValue(makeProduct(0));

      const result = await useCase.execute(makeInput({ quantity: 3 }));

      expect(result).toBeInstanceOf(Ok);
    });
  });

  describe('Fallo en la llamada a la pasarela', () => {
    beforeEach(() => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
    });

    it('retorna Err GATEWAY_CALL_FAILED y marca la transacción como ERROR', async () => {
      gateway.createTransaction.mockRejectedValue(
        new PaymentGatewayError('Error en la pasarela'),
      );

      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Err);
      expect((result as Err<any>).error.code).toBe('GATEWAY_CALL_FAILED');
      expect(txRepo.update).toHaveBeenCalledTimes(1);
      const savedTx = txRepo.update.mock.calls[0][0] as Transaction;
      expect(savedTx.status).toBe(TransactionStatus.ERROR);
    });

    it('retorna Err TIMEOUT cuando la pasarela lanza PaymentGatewayTimeoutError', async () => {
      gateway.createTransaction.mockRejectedValue(new PaymentGatewayTimeoutError());

      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Err);
      expect((result as Err<any>).error.code).toBe('TIMEOUT');
    });

    it('incluye el mensaje del error en el Err devuelto', async () => {
      gateway.createTransaction.mockRejectedValue(
        new PaymentGatewayError('mensaje específico del error'),
      );

      const result = await useCase.execute(makeInput()) as Err<any>;

      expect(result.error.message).toBe('mensaje específico del error');
    });

    it('no descuenta stock si la pasarela falla', async () => {
      gateway.createTransaction.mockRejectedValue(new PaymentGatewayError('error'));

      await useCase.execute(makeInput());

      expect(productRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('Happy path — APPROVED', () => {
    let product: Product;

    beforeEach(() => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      product = makeProduct(10);
      productRepo.findById.mockResolvedValue(product);
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({
        gatewayId: 'gw-ext-001',
        cardLastFour: '4242',
        cardBrand: 'VISA',
      });
      gateway.pollStatus.mockResolvedValue('APPROVED');
      productRepo.save.mockResolvedValue(makeProduct(9));
    });

    it('retorna Ok con status APPROVED', async () => {
      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<any>).value.status).toBe(TransactionStatus.APPROVED);
    });

    it('retorna el gatewayId en el resultado', async () => {
      const result = await useCase.execute(makeInput()) as Ok<any>;
      expect(result.value.gatewayId).toBe('gw-ext-001');
    });

    it('llama a markAsSentToGateway y luego persiste', async () => {
      await useCase.execute(makeInput());

      const firstUpdate = txRepo.update.mock.calls[0][0] as Transaction;
      expect(firstUpdate.gatewayId).toBe('gw-ext-001');
    });

    it('descuenta el stock del producto por la cantidad comprada', async () => {
      await useCase.execute(makeInput({ quantity: 3 }));

      expect(productRepo.save).toHaveBeenCalledTimes(1);
      const savedProduct = productRepo.save.mock.calls[0][0] as Product;
      expect(savedProduct.stock).toBe(7); // 10 - 3
    });

    it('crea la entrega con la dirección del pedido', async () => {
      const input = makeInput({ delivery: { address: 'Av. El Dorado 92', city: 'Bogotá', country: 'CO' } });
      await useCase.execute(input);

      expect(deliveryRepo.save).toHaveBeenCalledTimes(1);
      const delivery = deliveryRepo.save.mock.calls[0][0] as Delivery;
      expect(delivery.address).toBe('Av. El Dorado 92');
      expect(delivery.city).toBe('Bogotá');
    });

    it('envía los datos correctos a la pasarela', async () => {
      const input = makeInput();
      await useCase.execute(input);

      expect(gateway.createTransaction).toHaveBeenCalledWith({
        reference: input.reference,
        amountInCents: input.amountInCents,
        cardToken: input.cardToken,
        acceptanceToken: input.acceptanceToken,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      });
    });
  });

  describe('Happy path — DECLINED', () => {
    beforeEach(() => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-001', cardLastFour: '1234', cardBrand: 'MASTERCARD' });
      gateway.pollStatus.mockResolvedValue('DECLINED');
    });

    it('retorna Ok con status DECLINED', async () => {
      const result = await useCase.execute(makeInput());

      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<any>).value.status).toBe(TransactionStatus.DECLINED);
    });

    it('NO descuenta stock cuando el pago es declinado', async () => {
      await useCase.execute(makeInput());
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('la transacción queda con estado DECLINED en la DB', async () => {
      await useCase.execute(makeInput());

      const lastUpdate = txRepo.update.mock.calls.at(-1)![0] as Transaction;
      expect(lastUpdate.status).toBe(TransactionStatus.DECLINED);
    });
  });

  describe('Happy path — VOIDED', () => {
    beforeEach(() => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-001', cardLastFour: '9999', cardBrand: 'AMEX' });
      gateway.pollStatus.mockResolvedValue('VOIDED');
    });

    it('retorna Ok con status VOIDED y no descuenta stock', async () => {
      const result = await useCase.execute(makeInput()) as Ok<any>;

      expect(result.value.status).toBe(TransactionStatus.VOIDED);
      expect(productRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('Polling agotado', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('retorna Ok con ERROR si el polling se agota (null siempre)', async () => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-001', cardLastFour: '0000', cardBrand: 'VISA' });
      gateway.pollStatus.mockResolvedValue(null);

      const resultPromise = useCase.execute(makeInput());
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBeInstanceOf(Ok);
      expect((result as Ok<any>).value.status).toBe(TransactionStatus.ERROR);
    });

    it('NO descuenta stock cuando el polling se agota', async () => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-001', cardLastFour: '0000', cardBrand: 'VISA' });
      gateway.pollStatus.mockResolvedValue(null);

      const resultPromise = useCase.execute(makeInput());
      await jest.runAllTimersAsync();
      await resultPromise;

      expect(productRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('Polling con status inicial PENDING luego APPROVED', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('continúa el polling hasta obtener un estado terminal', async () => {
      txRepo.findByIdempotencyKey.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(makeProduct(10));
      deliveryRepo.save.mockResolvedValue(makeDelivery());
      const tx = makeSavedTransaction();
      txRepo.create.mockResolvedValue(tx);
      txRepo.update.mockResolvedValue(tx);
      gateway.createTransaction.mockResolvedValue({ gatewayId: 'gw-001', cardLastFour: '1111', cardBrand: 'VISA' });
      gateway.pollStatus
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('APPROVED');
      productRepo.save.mockResolvedValue(makeProduct(9));

      const resultPromise = useCase.execute(makeInput());
      await jest.runAllTimersAsync();
      const result = await resultPromise as Ok<any>;

      expect(gateway.pollStatus).toHaveBeenCalledTimes(3);
      expect(result.value.status).toBe(TransactionStatus.APPROVED);
    });
  });
});
