import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDeliveryDto } from '../infrastructure/http/dto/create-delivery.dto';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('CreateDeliveryDto', () => {
  const valid = {
    customerId: VALID_UUID,
    address: 'Calle 123 # 45-67',
    city: 'Bogotá',
    country: 'CO',
  };

  it('pasa con datos válidos', async () => {
    const dto = plainToInstance(CreateDeliveryDto, valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si customerId no es UUID', async () => {
    const dto = plainToInstance(CreateDeliveryDto, { ...valid, customerId: 'no-es-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerId')).toBe(true);
  });

  it('falla si address está vacío', async () => {
    const dto = plainToInstance(CreateDeliveryDto, { ...valid, address: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'address')).toBe(true);
  });

  it('falla si city está vacío', async () => {
    const dto = plainToInstance(CreateDeliveryDto, { ...valid, city: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'city')).toBe(true);
  });

  it('falla si country está vacío', async () => {
    const dto = plainToInstance(CreateDeliveryDto, { ...valid, country: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'country')).toBe(true);
  });

  it('falla si customerId está ausente', async () => {
    const { customerId: _, ...rest } = valid;
    const dto = plainToInstance(CreateDeliveryDto, rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerId')).toBe(true);
  });
});
