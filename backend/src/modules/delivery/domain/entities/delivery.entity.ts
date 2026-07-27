import { v4 as uuidv4 } from 'uuid';

export class Delivery {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly country: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  static create(properties: {
    customerId: string;
    address: string;
    city: string;
    country: string;
  }): Delivery {
    const now = new Date();
    return new Delivery(
      uuidv4(),
      properties.customerId,
      properties.address,
      properties.city,
      properties.country,
      now,
      now,
    );
  }

  static reconstitute(properties: {
    id: string;
    customerId: string;
    address: string;
    city: string;
    country: string;
    createdAt: Date;
    updatedAt: Date;
  }): Delivery {
    return new Delivery(
      properties.id,
      properties.customerId,
      properties.address,
      properties.city,
      properties.country,
      properties.createdAt,
      properties.updatedAt,
    );
  }

  private validate(): void {
    if (this.customerId.length < 3) {
      throw new Error('El id del cliente no tiene un formato válido');
    }
  }
}
