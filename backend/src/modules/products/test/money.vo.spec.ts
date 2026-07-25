import { Money } from '../domain/value-objects/money.vo';

describe('Money Value Object', () => {
  describe('constructor', () => {
    it('crea un Money con COP por defecto', () => {
      const money = new Money(5000);
      expect(money.amount).toBe(5000);
      expect(money.currency).toBe('COP');
    });

    it('crea un Money con moneda personalizada', () => {
      const money = new Money(100, 'USD');
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('acepta amount en cero', () => {
      expect(() => new Money(0)).not.toThrow();
    });

    it('lanza error si el amount es negativo', () => {
      expect(() => new Money(-1)).toThrow('El precio no puede ser negativo');
    });

    it('lanza error con cualquier negativo', () => {
      expect(() => new Money(-0.01)).toThrow('El precio no puede ser negativo');
    });
  });

  describe('toString()', () => {
    it('retorna la representación correcta', () => {
      expect(new Money(5000).toString()).toBe('COP 5000');
    });

    it('incluye la moneda personalizada', () => {
      expect(new Money(99, 'USD').toString()).toBe('USD 99');
    });
  });
});
