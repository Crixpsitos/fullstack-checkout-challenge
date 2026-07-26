import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCustomerDto } from '../infrastructure/http/dto/create-customer.dto';
import { UpdateCustomerDto } from '../infrastructure/http/dto/update-customer.dto';

describe('CreateCustomerDto', () => {
  const valid = {
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '3001234567',
  };

  it('pasa con datos válidos', async () => {
    const dto = plainToInstance(CreateCustomerDto, valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si name está vacío', async () => {
    const dto = plainToInstance(CreateCustomerDto, { ...valid, name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('falla si email no tiene formato válido', async () => {
    const dto = plainToInstance(CreateCustomerDto, { ...valid, email: 'no-es-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('falla si email está vacío', async () => {
    const dto = plainToInstance(CreateCustomerDto, { ...valid, email: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('falla si phone está vacío', async () => {
    const dto = plainToInstance(CreateCustomerDto, { ...valid, phone: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('falla si name está ausente', async () => {
    const { name: _, ...rest } = valid;
    const dto = plainToInstance(CreateCustomerDto, rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});

describe('UpdateCustomerDto', () => {
  it('pasa con objeto vacío — todos los campos son opcionales', async () => {
    const dto = plainToInstance(UpdateCustomerDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('pasa actualizando solo el nombre', async () => {
    const dto = plainToInstance(UpdateCustomerDto, { name: 'Ana García' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si email tiene formato inválido', async () => {
    const dto = plainToInstance(UpdateCustomerDto, { email: 'no-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('falla si name es string vacío', async () => {
    const dto = plainToInstance(UpdateCustomerDto, { name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('falla si phone es string vacío', async () => {
    const dto = plainToInstance(UpdateCustomerDto, { phone: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });
});
