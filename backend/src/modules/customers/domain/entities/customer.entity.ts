import { v4 as uuidv4 } from 'uuid';

export class Customer {
  private constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public phone: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  static create(properties: {
    name: string;
    email: string;
    phone: string;
  }): Customer {
    const now = new Date();
    return new Customer(
      uuidv4(),
      properties.name.trim(),
      properties.email.trim().toLowerCase(),
      properties.phone.trim(),
      now,
      now,
    );
  }

  static reconstitute(properties: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    return new Customer(
      properties.id,
      properties.name,
      properties.email,
      properties.phone,
      properties.createdAt,
      properties.updatedAt,
    );
  }

  private validate(): void {
    if (this.name.length < 3) {
      throw new Error('El nombre del cliente debe tener al menos 3 caracteres');
    }

    if (
      !this.email ||
      !/^[a-z0-9-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(this.email)
    ) {
      throw new Error('El email del cliente no tiene un formato válido.');
    }

    if (!this.phone || this.phone.length < 7) {
      throw new Error('El teléfono del cliente no es válido.');
    }
  }
}
