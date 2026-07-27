import { Ok, Err, ok, err, isOk, isErr, Result } from './result';

describe('Result — Ok', () => {
  it('ok() crea una instancia de Ok', () => {
    const result = ok(42);
    expect(result).toBeInstanceOf(Ok);
    expect(result.value).toBe(42);
  });

  it('isOk() retorna true', () => {
    expect(ok('val').isOk()).toBe(true);
  });

  it('isErr() retorna false', () => {
    expect(ok('val').isErr()).toBe(false);
  });

  it('funciona con valor undefined', () => {
    const result = ok(undefined);
    expect(result).toBeInstanceOf(Ok);
    expect(result.value).toBeUndefined();
  });

  it('funciona con objeto complejo', () => {
    const obj = { id: 1, name: 'test' };
    const result = ok(obj);
    expect(result.value).toBe(obj);
  });
});

describe('Result — Err', () => {
  it('err() crea una instancia de Err', () => {
    const error = new Error('falló');
    const result = err(error);
    expect(result).toBeInstanceOf(Err);
    expect(result.error).toBe(error);
  });

  it('isOk() retorna false', () => {
    expect(err(new Error()).isOk()).toBe(false);
  });

  it('isErr() retorna true', () => {
    expect(err(new Error()).isErr()).toBe(true);
  });

  it('funciona con error tipado personalizado', () => {
    class DomainError extends Error {
      readonly code = 'DOMAIN_ERROR';
    }
    const result = err(new DomainError('error'));
    expect(result.error.code).toBe('DOMAIN_ERROR');
  });
});

describe('Type guards standalone — isOk / isErr', () => {
  it('isOk() estrecha el tipo a Ok<T>', () => {
    const result: Result<number, Error> = ok(5);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(5);
    }
  });

  it('isErr() estrecha el tipo a Err<E>', () => {
    const result: Result<number, Error> = err(new Error('fallo'));
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('fallo');
    }
  });

  it('isOk retorna false para Err', () => {
    expect(isOk(err(new Error()))).toBe(false);
  });

  it('isErr retorna false para Ok', () => {
    expect(isErr(ok(1))).toBe(false);
  });
});

describe('instanceof narrowing', () => {
  it('instanceof Ok estrecha correctamente', () => {
    const result: Result<string, Error> = ok('hola');
    if (result instanceof Ok) {
      expect(result.value).toBe('hola');
    } else {
      fail('debería ser Ok');
    }
  });

  it('instanceof Err estrecha correctamente', () => {
    const result: Result<string, Error> = err(new Error('boom'));
    if (result instanceof Err) {
      expect(result.error.message).toBe('boom');
    } else {
      fail('debería ser Err');
    }
  });
});
