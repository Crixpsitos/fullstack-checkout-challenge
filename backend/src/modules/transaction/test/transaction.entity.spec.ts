import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionStatus } from '../domain/entities/transaction-status.vo';
import {
  InvalidTransactionAmountError,
  TransactionAlreadyResolvedError,
} from '../domain/errors/transaction.errors';
import {
  PaymentGatewayError,
  PaymentGatewayTimeoutError,
} from '../domain/errors/payment-gateway.errors';

const makeTransaction = (
  overrides: Partial<Parameters<typeof Transaction.reconstitute>[0]> = {},
) =>
  Transaction.reconstitute({
    id: 'tx-id-001',
    idempotencyKey: 'idem-key-abc',
    reference: 'REF-00001',
    gatewayId: null,
    status: TransactionStatus.PENDING,
    amountInCents: 500_000,
    productId: 'prod-id-001',
    customerId: 'cust-id-001',
    deliveryId: 'deliv-id-001',
    cardLastFour: null,
    cardBrand: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('Transaction entity', () => {
  describe('Transaction.create()', () => {
    it('crea transacción con estado PENDING', () => {
      const tx = Transaction.create({
        idempotencyKey: 'idem-abc-1234',
        reference: 'REF-ABCD',
        amountInCents: 100_000,
        productId: 'prod-uuid-001',
        customerId: 'cust-uuid-001',
        deliveryId: 'deliv-uuid-001',
      });

      expect(tx.status).toBe(TransactionStatus.PENDING);
      expect(tx.gatewayId).toBeNull();
      expect(tx.cardLastFour).toBeNull();
      expect(tx.cardBrand).toBeNull();
    });

    it('genera un ID único (uuidv7)', () => {
      const tx1 = Transaction.create({
        idempotencyKey: 'idem-001',
        reference: 'REF-001',
        amountInCents: 100_000,
        productId: 'prod-id',
        customerId: 'cust-id',
        deliveryId: 'deliv-id',
      });
      const tx2 = Transaction.create({
        idempotencyKey: 'idem-002',
        reference: 'REF-002',
        amountInCents: 100_000,
        productId: 'prod-id',
        customerId: 'cust-id',
        deliveryId: 'deliv-id',
      });

      expect(tx1.id).toBeDefined();
      expect(tx1.id).not.toBe(tx2.id);
    });

    it('lanza InvalidTransactionAmountError cuando amountInCents es 0', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'idem-abc-x',
          reference: 'REF-X001',
          amountInCents: 0,
          productId: 'prod-id',
          customerId: 'cust-id',
          deliveryId: 'deliv-id',
        }),
      ).toThrow(InvalidTransactionAmountError);
    });

    it('lanza InvalidTransactionAmountError cuando amountInCents es negativo', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'idem-abc-x',
          reference: 'REF-X002',
          amountInCents: -1,
          productId: 'prod-id',
          customerId: 'cust-id',
          deliveryId: 'deliv-id',
        }),
      ).toThrow(InvalidTransactionAmountError);
    });

    it('lanza Error cuando idempotencyKey es muy corta', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'ab',
          reference: 'REF-001',
          amountInCents: 100_000,
          productId: 'prod-id',
          customerId: 'cust-id',
          deliveryId: 'deliv-id',
        }),
      ).toThrow();
    });

    it('lanza Error cuando productId es muy corto', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'idem-abc-ok',
          reference: 'REF-001',
          amountInCents: 100_000,
          productId: 'ab',
          customerId: 'cust-uuid-ok',
          deliveryId: 'deliv-uuid-ok',
        }),
      ).toThrow();
    });

    it('lanza Error cuando customerId es muy corto', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'idem-abc-ok',
          reference: 'REF-001',
          amountInCents: 100_000,
          productId: 'prod-uuid-ok',
          customerId: 'ab',
          deliveryId: 'deliv-uuid-ok',
        }),
      ).toThrow();
    });

    it('lanza Error cuando deliveryId es muy corto', () => {
      expect(() =>
        Transaction.create({
          idempotencyKey: 'idem-abc-ok',
          reference: 'REF-001',
          amountInCents: 100_000,
          productId: 'prod-uuid-ok',
          customerId: 'cust-uuid-ok',
          deliveryId: 'ab',
        }),
      ).toThrow();
    });
  });

  describe('Transaction.reconstitute()', () => {
    it('reconstituye la transacción con los datos exactos', () => {
      const tx = makeTransaction({ status: TransactionStatus.APPROVED, gatewayId: 'gw-123' });

      expect(tx.id).toBe('tx-id-001');
      expect(tx.status).toBe(TransactionStatus.APPROVED);
      expect(tx.gatewayId).toBe('gw-123');
    });
  });

  describe('markAsSentToGateway()', () => {
    it('asigna gatewayId, cardLastFour y cardBrand', () => {
      const tx = makeTransaction();
      tx.markAsSentToGateway('gw-id-abc', '4242', 'VISA');

      expect(tx.gatewayId).toBe('gw-id-abc');
      expect(tx.cardLastFour).toBe('4242');
      expect(tx.cardBrand).toBe('VISA');
    });

    it('actualiza updatedAt', () => {
      const tx = makeTransaction();
      const before = tx.updatedAt;
      tx.markAsSentToGateway('gw-id', '1234', 'MASTERCARD');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('resolveWithStatus()', () => {
    it('cambia el estado a APPROVED', () => {
      const tx = makeTransaction();
      tx.resolveWithStatus(TransactionStatus.APPROVED);
      expect(tx.status).toBe(TransactionStatus.APPROVED);
    });

    it('cambia el estado a DECLINED', () => {
      const tx = makeTransaction();
      tx.resolveWithStatus(TransactionStatus.DECLINED);
      expect(tx.status).toBe(TransactionStatus.DECLINED);
    });

    it('cambia el estado a ERROR', () => {
      const tx = makeTransaction();
      tx.resolveWithStatus(TransactionStatus.ERROR);
      expect(tx.status).toBe(TransactionStatus.ERROR);
    });

    it('lanza TransactionAlreadyResolvedError si ya está APPROVED', () => {
      const tx = makeTransaction({ status: TransactionStatus.APPROVED });
      expect(() => tx.resolveWithStatus(TransactionStatus.DECLINED)).toThrow(
        TransactionAlreadyResolvedError,
      );
    });

    it('lanza TransactionAlreadyResolvedError si ya está DECLINED', () => {
      const tx = makeTransaction({ status: TransactionStatus.DECLINED });
      expect(() => tx.resolveWithStatus(TransactionStatus.ERROR)).toThrow(
        TransactionAlreadyResolvedError,
      );
    });

    it('el mensaje del error incluye el estado actual', () => {
      const tx = makeTransaction({ status: TransactionStatus.ERROR });
      let caught: Error | null = null;
      try {
        tx.resolveWithStatus(TransactionStatus.APPROVED);
      } catch (e) {
        caught = e as Error;
      }
      expect(caught).not.toBeNull();
      expect(caught!.message).toContain('ERROR');
    });
  });

  describe('isApproved()', () => {
    it('retorna true solo cuando el estado es APPROVED', () => {
      expect(makeTransaction({ status: TransactionStatus.APPROVED }).isApproved()).toBe(true);
    });

    it('retorna false para PENDING', () => {
      expect(makeTransaction({ status: TransactionStatus.PENDING }).isApproved()).toBe(false);
    });

    it('retorna false para DECLINED', () => {
      expect(makeTransaction({ status: TransactionStatus.DECLINED }).isApproved()).toBe(false);
    });

    it('retorna false para ERROR', () => {
      expect(makeTransaction({ status: TransactionStatus.ERROR }).isApproved()).toBe(false);
    });
  });
});

describe('PaymentGatewayError', () => {
  it('instancia correctamente con mensaje', () => {
    const err = new PaymentGatewayError('Error de prueba');
    expect(err.message).toBe('Error de prueba');
    expect(err.code).toBe('PAYMENT_GATEWAY_ERROR');
    expect(err.name).toBe('PaymentGatewayError');
  });

  it('acepta cause como segundo argumento', () => {
    const cause = new Error('causa');
    const err = new PaymentGatewayError('mensaje', cause);
    expect(err.cause).toBe(cause);
  });
});

describe('PaymentGatewayTimeoutError', () => {
  it('tiene code PAYMENT_GATEWAY_TIMEOUT', () => {
    const err = new PaymentGatewayTimeoutError();
    expect(err.code).toBe('PAYMENT_GATEWAY_TIMEOUT');
  });

  it('hereda de PaymentGatewayError', () => {
    expect(new PaymentGatewayTimeoutError()).toBeInstanceOf(PaymentGatewayError);
  });
});
