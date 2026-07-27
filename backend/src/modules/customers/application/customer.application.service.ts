import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../domain/entities/customer.entity';
import { Delivery } from '../../delivery/domain/entities/delivery.entity';
import {
  type ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../domain/ports/customer.repository.port';
import {
  type IDeliveryRepository,
  DELIVERY_REPOSITORY,
} from '../../delivery/domain/ports/delivery.repository.port';
import { CreateCustomerDto } from '../infrastructure/http/dto/create-customer.dto';
import { UpdateCustomerDto } from '../infrastructure/http/dto/update-customer.dto';
import { Result, ok, err } from 'src/shared/result/result';
import {
  CustomerNotFoundError,
  CustomerInvalidEmailError,
  CustomerInvalidPhoneError,
} from '../domain/errors/customer.errors';

@Injectable()
export class CustomerApplicationService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async getAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async getById(
    id: string,
  ): Promise<
    Result<
      { customer: Customer; latestDelivery: Delivery | null },
      CustomerNotFoundError
    >
  > {
    const customer = await this.customerRepository.findById(id);
    if (!customer) return err(new CustomerNotFoundError(id));
    const latestDelivery =
      await this.deliveryRepository.findLatestByCustomerId(id);
    return ok({ customer, latestDelivery });
  }

  async getByEmail(
    email: string,
  ): Promise<{ customer: Customer; latestDelivery: Delivery | null } | null> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) return null;
    const latestDelivery = await this.deliveryRepository.findLatestByCustomerId(
      customer.id,
    );
    return { customer, latestDelivery };
  }

  async create(
    dto: CreateCustomerDto,
  ): Promise<
    Result<Customer, CustomerInvalidEmailError | CustomerInvalidPhoneError>
  > {
    const existing = await this.customerRepository.findByEmail(dto.email);
    if (existing) return err(new CustomerInvalidEmailError(dto.email));
    const existingPhone = await this.customerRepository.findByPhone(dto.phone);
    if (existingPhone) return err(new CustomerInvalidPhoneError(dto.phone));
    const customer = Customer.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });
    return ok(await this.customerRepository.save(customer));
  }

  async createOrUpdate(
    dto: CreateCustomerDto,
  ): Promise<
    Result<{ customer: Customer; created: boolean }, CustomerInvalidPhoneError>
  > {
    const existing = await this.customerRepository.findByEmail(dto.email);

    if (existing) {
      if (dto.phone !== existing.phone) {
        const phoneOwner = await this.customerRepository.findByPhone(dto.phone);
        if (phoneOwner && phoneOwner.id !== existing.id) {
          return err(new CustomerInvalidPhoneError(dto.phone));
        }
      }
      existing.name = dto.name.trim();
      existing.phone = dto.phone.trim();
      existing.updatedAt = new Date();
      const customer = await this.customerRepository.save(existing);
      await this.syncDelivery(customer.id, dto);
      return ok({ customer, created: false });
    }

    const phoneOwner = await this.customerRepository.findByPhone(dto.phone);
    if (phoneOwner) return err(new CustomerInvalidPhoneError(dto.phone));

    const customer = await this.customerRepository.save(
      Customer.create({ name: dto.name, email: dto.email, phone: dto.phone }),
    );
    await this.syncDelivery(customer.id, dto);
    return ok({ customer, created: true });
  }

  private async syncDelivery(
    customerId: string,
    dto: CreateCustomerDto,
  ): Promise<void> {
    if (!dto.address || !dto.city || !dto.country) return;

    const latest =
      await this.deliveryRepository.findLatestByCustomerId(customerId);

    const addressChanged =
      !latest ||
      latest.address !== dto.address.trim() ||
      latest.city !== dto.city.trim() ||
      latest.country !== dto.country.trim();

    if (addressChanged) {
      await this.deliveryRepository.save(
        Delivery.create({
          customerId,
          address: dto.address.trim(),
          city: dto.city.trim(),
          country: dto.country.trim(),
        }),
      );
    }
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Result<Customer, CustomerNotFoundError>> {
    // Inlining findById evita el problema de narrowing de ESLint con Ok<T>
    const customer = await this.customerRepository.findById(id);
    if (!customer) return err(new CustomerNotFoundError(id));

    if (dto.name) customer.name = dto.name.trim();
    if (dto.email) customer.email = dto.email.trim().toLowerCase();
    if (dto.phone) customer.phone = dto.phone.trim();

    return ok(await this.customerRepository.save(customer));
  }
}
