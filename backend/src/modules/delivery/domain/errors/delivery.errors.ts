export enum DeliveryErrorCode {
  NOT_FOUND = 'DELIVERY_NOT_FOUND',
  INVALID_ADDRESS = 'DELIVERY_INVALID_ADDRESS',
}

export class DeliveryNotFoundError extends Error {
  readonly code = DeliveryErrorCode.NOT_FOUND;
  constructor(id: string) {
    super(`Delivery ${id} no encontrado`);
    this.name = 'DeliveryNotFoundError';
  }
}

export class DeliveryInvalidAddressError extends Error {
  readonly code = DeliveryErrorCode.INVALID_ADDRESS;
  constructor(address: string) {
    super(`La dirección ${address} no es válida`);
    this.name = 'DeliveryInvalidAddressError';
  }
}

export type DeliveryError = DeliveryNotFoundError | DeliveryInvalidAddressError;
