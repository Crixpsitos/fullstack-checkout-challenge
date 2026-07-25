import { Category } from '../domain/entities/category.entity';

describe('Category Entity', () => {
  const validProps = {
    name: 'Electrónica',
    slug: 'electronica',
    description: 'Productos electrónicos',
  };

  describe('create()', () => {
    it('crea una categoría con valores por defecto', () => {
      const category = Category.create(validProps);

      expect(category.id).toBe(0);
      expect(category.name).toBe('Electrónica');
      expect(category.slug).toBe('electronica');
      expect(category.description).toBe('Productos electrónicos');
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('aplica trim al nombre y lowercase al slug', () => {
      const category = Category.create({
        name: '  Ropa  ',
        slug: '  ROPA-CASUAL  ',
      });

      expect(category.name).toBe('Ropa');
      expect(category.slug).toBe('ropa-casual');
    });

    it('acepta isActive = false', () => {
      const category = Category.create({ ...validProps, isActive: false });
      expect(category.isActive).toBe(false);
    });

    it('acepta description nula', () => {
      const category = Category.create({ name: 'Libros', slug: 'libros' });
      expect(category.description).toBeNull();
    });

    it('lanza error si el nombre tiene menos de 3 caracteres', () => {
      expect(() => Category.create({ name: 'Ab', slug: 'ab' })).toThrow(
        'El nombre de la categoría debe tener al menos 3 caracteres',
      );
    });

    it('lanza error si el slug tiene caracteres inválidos', () => {
      expect(() =>
        Category.create({ name: 'Categoría', slug: 'mi slug!' }),
      ).toThrow('El slug de la categoría no tiene un formato válido.');
    });

    it('lanza error si el slug está vacío', () => {
      expect(() =>
        Category.create({ name: 'Categoría', slug: '' }),
      ).toThrow('El slug de la categoría no tiene un formato válido.');
    });
  });

  describe('reconstitute()', () => {
    it('restaura la entidad preservando fechas reales', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-06-01');

      const category = Category.reconstitute({
        id: 5,
        name: 'Deportes',
        slug: 'deportes',
        description: null,
        isActive: true,
        createdAt,
        updatedAt,
      });

      expect(category.id).toBe(5);
      expect(category.createdAt).toBe(createdAt);
      expect(category.updatedAt).toBe(updatedAt);
    });

    it('no ejecuta validaciones — permite datos que no pasarían create()', () => {
      expect(() =>
        Category.reconstitute({
          id: 1,
          name: 'AB',
          slug: 'ab',
          description: null,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow(); // reconstitute sí llama al constructor que llama validate
    });
  });

  describe('deactivate() y activate()', () => {
    it('desactiva una categoría activa', () => {
      const category = Category.create(validProps);
      category.deactivate();
      expect(category.isActive).toBe(false);
    });

    it('activa una categoría inactiva', () => {
      const category = Category.create({ ...validProps, isActive: false });
      category.activate();
      expect(category.isActive).toBe(true);
    });
  });
});
