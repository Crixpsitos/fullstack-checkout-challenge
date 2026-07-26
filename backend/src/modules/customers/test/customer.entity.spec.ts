import { Customer } from '../domain/entities/customer.entity';

describe('Customer Entity', () => {
  const validProps = { name: 'Juan Pérez', email: 'juan@email.com', phone: '3001234567' };

  describe('create()', () => {
    it('crea un customer con UUID generado', () => {
      const customer = Customer.create(validProps);
      expect(customer.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(customer.name).toBe('Juan Pérez');
      expect(customer.email).toBe('juan@email.com');
      expect(customer.phone).toBe('3001234567');
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('aplica trim al nombre y lowercase al email', () => {
      const c = Customer.create({ name: '  Ana  ', email: '  ANA@EMAIL.COM  ', phone: '3009999999' });
      expect(c.name).toBe('Ana');
      expect(c.email).toBe('ana@email.com');
    });

    it('lanza error si el nombre tiene menos de 3 caracteres', () => {
      expect(() => Customer.create({ ...validProps, name: 'AB' })).toThrow(
        'El nombre del cliente debe tener al menos 3 caracteres',
      );
    });

    it('lanza error si el email tiene formato inválido', () => {
      expect(() => Customer.create({ ...validProps, email: 'no-es-email' })).toThrow(
        'El email del cliente no tiene un formato válido.',
      );
    });

    it('lanza error si el teléfono tiene menos de 7 caracteres', () => {
      expect(() => Customer.create({ ...validProps, phone: '123' })).toThrow(
        'El teléfono del cliente no es válido.',
      );
    });
  });

  describe('reconstitute()', () => {
    it('restaura preservando fechas originales', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-06-01');
      const customer = Customer.reconstitute({ id: 'some-id', ...validProps, createdAt, updatedAt });
      expect(customer.id).toBe('some-id');
      expect(customer.createdAt).toBe(createdAt);
      expect(customer.updatedAt).toBe(updatedAt);
    });
  });
});
