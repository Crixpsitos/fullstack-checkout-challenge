import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { ProductFilterDto } from '../infrastructure/http/dto/product-filter.dto';

describe('PaginationDto', () => {
  it('usa defaults page=1, limit=10 si no se envía nada', async () => {
    const dto = plainToInstance(PaginationDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('@Type convierte strings a number', async () => {
    const dto = plainToInstance(PaginationDto, { page: '3', limit: '20' });
    expect(typeof dto.page).toBe('number');
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(20);
  });

  it('falla si page es 0', async () => {
    const dto = plainToInstance(PaginationDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('falla si limit es 0', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('falla si page no es entero', async () => {
    const dto = plainToInstance(PaginationDto, { page: 1.5 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });
});

describe('ProductFilterDto', () => {
  const base = { page: 1, limit: 10 };

  it('pasa solo con paginación', async () => {
    const dto = plainToInstance(ProductFilterDto, base);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('@Type convierte categoryId de string a number', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, categoryId: '2' });
    expect(typeof dto.categoryId).toBe('number');
    expect(dto.categoryId).toBe(2);
  });

  it('@Type convierte minPrice de string a number', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, minPrice: '500' });
    expect(typeof dto.minPrice).toBe('number');
    expect(dto.minPrice).toBe(500);
  });

  it('@Type convierte maxPrice de string a number', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, maxPrice: '9999.99' });
    expect(typeof dto.maxPrice).toBe('number');
    expect(dto.maxPrice).toBe(9999.99);
  });

  it('falla si categoryId es 0', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, categoryId: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
  });

  it('falla si minPrice es negativo', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, minPrice: -1 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'minPrice')).toBe(true);
  });

  it('acepta q como string libre', async () => {
    const dto = plainToInstance(ProductFilterDto, { ...base, q: 'laptop gaming' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.q).toBe('laptop gaming');
  });
});
