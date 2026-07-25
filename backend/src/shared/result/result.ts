export class Ok<T> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T> {
    return true;
  }
  isErr(): this is Err<never> {
    return false;
  }
}

export class Err<E> {
  constructor(public readonly error: E) {}
  isOk(): this is Ok<never> {
    return false;
  }
  isErr(): this is Err<E> {
    return true;
  }
}

export type Result<T, E = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => new Ok(value);
export const err = <E>(error: E): Err<E> => new Err(error);

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r instanceof Ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => r instanceof Err;
