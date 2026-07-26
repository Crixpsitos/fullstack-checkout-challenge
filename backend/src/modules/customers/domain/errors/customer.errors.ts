export enum CustomerErrorCode {
  NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  INVALID_EMAIL = 'CUSTOMER_INVALID_EMAIL',
  INVALID_PHONE = 'CUSTOMER_INVALID_PHONE',
}

export class CustomerNotFoundError extends Error {
  readonly code = CustomerErrorCode.NOT_FOUND;
  constructor(id: string) {
    super(`Customer ${id} no encontrado`);
    this.name = 'CustomerNotFoundError';
  }
}

export class CustomerInvalidEmailError extends Error {
  readonly code = CustomerErrorCode.INVALID_EMAIL;
  constructor(email: string) {
    super(`El email ${email} no es válido`);
    this.name = 'CustomerInvalidEmailError';
  }
}

export class CustomerInvalidPhoneError extends Error {
  readonly code = CustomerErrorCode.INVALID_PHONE;
  constructor(phone: string) {
    super(`El teléfono ${phone} no es válido`);
    this.name = 'CustomerInvalidPhoneError';
  }
}

export type CustomerError =
  CustomerNotFoundError | CustomerInvalidEmailError | CustomerInvalidPhoneError;
