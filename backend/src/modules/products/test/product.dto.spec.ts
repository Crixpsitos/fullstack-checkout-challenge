import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from '../infrastructure/http/dto/create-product.dto';
import { UpdateProductDto } from '../infrastructure/http/dto/update-product.dto';

describe('CreateProductDto', () => {
  const valid = {
    name: 'Laptop Lenovo',
    description: 'Laptop de alta gama',
    price: 2500000,
    stock: 10,
    imageUrl: 'https://example.com/laptop.jpg',
    categoryId: 1,
  };

  it('pasa con datos válidos', async () => {
    const dto = plainToInstance(CreateProductDto, valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si name está vacío', async () => {
    const dto = plainToInstance(CreateProductDto, { ...valid, name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('falla si price es negativo', async () => {
    const dto = plainToInstance(CreateProductDto, { ...valid, price: -1 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('falla si stock es negativo', async () => {
    const dto = plainToInstance(CreateProductDto, { ...valid, stock: -1 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'stock')).toBe(true);
  });

  it('falla si imageUrl no es una URL válida', async () => {
    const dto = plainToInstance(CreateProductDto, {
      ...valid,
      imageUrl: 'no-es-url',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'imageUrl')).toBe(true);
  });

  it('falla si categoryId es 0 o negativo', async () => {
    const dto = plainToInstance(CreateProductDto, { ...valid, categoryId: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
  });

  it('falla si price tiene más de 2 decimales', async () => {
    const dto = plainToInstance(CreateProductDto, {
      ...valid,
      price: 10.999,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });
});

describe('UpdateProductDto', () => {
  it('pasa con objeto vacío — todos los campos son opcionales', async () => {
    const dto = plainToInstance(UpdateProductDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('pasa actualizando solo el precio', async () => {
    const dto = plainToInstance(UpdateProductDto, { price: 99000 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si stock es decimal', async () => {
    const dto = plainToInstance(UpdateProductDto, { stock: 1.5 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'stock')).toBe(true);
  });

  it('falla si imageUrl no es URL', async () => {
    const dto = plainToInstance(UpdateProductDto, { imageUrl: 'mala-url' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'imageUrl')).toBe(true);
  });
});
