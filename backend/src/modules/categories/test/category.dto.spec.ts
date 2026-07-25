import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from '../infrastructure/http/dto/create-category.dto';
import { UpdateCategoryDto } from '../infrastructure/http/dto/update-category.dto';

describe('CreateCategoryDto', () => {
  const valid = {
    name: 'Electrónica',
    slug: 'electronica',
    description: 'Descripción válida',
    isActive: true,
  };

  it('pasa con datos válidos', async () => {
    const dto = plainToInstance(CreateCategoryDto, valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si name está vacío', async () => {
    const dto = plainToInstance(CreateCategoryDto, { ...valid, name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('falla si slug está vacío', async () => {
    const dto = plainToInstance(CreateCategoryDto, { ...valid, slug: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });

  it('falla si description está ausente', async () => {
    const { description: _, ...rest } = valid;
    const dto = plainToInstance(CreateCategoryDto, rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('falla si isActive no es booleano', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      ...valid,
      isActive: 'yes',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });
});

describe('UpdateCategoryDto', () => {
  it('pasa con objeto vacío — todos los campos son opcionales', async () => {
    const dto = plainToInstance(UpdateCategoryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('pasa actualizando solo el nombre', async () => {
    const dto = plainToInstance(UpdateCategoryDto, { name: 'Nuevo nombre' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('falla si name es string vacío', async () => {
    const dto = plainToInstance(UpdateCategoryDto, { name: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('falla si isActive no es booleano', async () => {
    const dto = plainToInstance(UpdateCategoryDto, { isActive: 'true' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });
});
