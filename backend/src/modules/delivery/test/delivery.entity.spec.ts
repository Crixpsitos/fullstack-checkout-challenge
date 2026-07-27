import { Delivery } from '../domain/entities/delivery.entity';
import { DeliveryErrorCode, DeliveryNotFoundError, DeliveryInvalidAddressError } from '../domain/errors/delivery.errors';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('Delivery Entity', () => {
  describe('create()', () => {
    it('crea una delivery con UUID generado', () => {
      const delivery = Delivery.create({
        customerId: VALID_UUID,
        address: 'Calle 123 # 45-67',
        city: 'Bogotá',
        country: 'CO',
      });

      expect(delivery.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(delivery.customerId).toBe(VALID_UUID);
      expect(delivery.address).toBe('Calle 123 # 45-67');
      expect(delivery.city).toBe('Bogotá');
      expect(delivery.country).toBe('CO');
      expect(delivery.createdAt).toBeInstanceOf(Date);
      expect(delivery.updatedAt).toBeInstanceOf(Date);
    });

    it('lanza error si el customerId tiene menos de 3 caracteres', () => {
      expect(() =>
        Delivery.create({ customerId: 'ab', address: 'Calle 1', city: 'Bogotá', country: 'CO' }),
      ).toThrow('El id del cliente no tiene un formato válido');
    });
  });

  describe('reconstitute()', () => {
    it('restaura preservando todas las propiedades y fechas', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-06-01');

      const delivery = Delivery.reconstitute({
        id: VALID_UUID,
        customerId: VALID_UUID,
        address: 'Carrera 7 # 32-10',
        city: 'Medellín',
        country: 'CO',
        createdAt,
        updatedAt,
      });

      expect(delivery.id).toBe(VALID_UUID);
      expect(delivery.customerId).toBe(VALID_UUID);
      expect(delivery.city).toBe('Medellín');
      expect(delivery.createdAt).toBe(createdAt);
      expect(delivery.updatedAt).toBe(updatedAt);
    });
  });
});

describe('Delivery Errors', () => {
  describe('DeliveryNotFoundError', () => {
    it('tiene code DELIVERY_NOT_FOUND y mensaje correcto', () => {
      const error = new DeliveryNotFoundError('uuid-123');
      expect(error.code).toBe(DeliveryErrorCode.NOT_FOUND);
      expect(error.message).toContain('uuid-123');
      expect(error.name).toBe('DeliveryNotFoundError');
    });
  });

  describe('DeliveryInvalidAddressError', () => {
    it('tiene code DELIVERY_INVALID_ADDRESS y mensaje correcto', () => {
      const error = new DeliveryInvalidAddressError('dir inválida');
      expect(error.code).toBe(DeliveryErrorCode.INVALID_ADDRESS);
      expect(error.message).toContain('dir inválida');
      expect(error.name).toBe('DeliveryInvalidAddressError');
    });
  });
});
