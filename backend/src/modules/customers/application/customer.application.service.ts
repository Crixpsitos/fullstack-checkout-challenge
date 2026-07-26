import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../domain/entities/customer.entity';
import {
  type ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../domain/ports/customer.repository.port';
import { CreateCustomerDto } from '../infrastructure/http/dto/create-customer.dto';
import { UpdateCustomerDto } from '../infrastructure/http/dto/update-customer.dto';
import { Result, ok, err, Err } from 'src/shared/result/result';
import {
  CustomerError,
  CustomerNotFoundError,
  CustomerInvalidEmailError,
  CustomerInvalidPhoneError,
} from '../domain/errors/customer.errors';

@Injectable()
export class CustomerApplicationService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async getAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async getById(id: string): Promise<Result<Customer, CustomerNotFoundError>> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) return err(new CustomerNotFoundError(id));
    return ok(customer);
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
  ): Promise<Result<{ customer: Customer; created: boolean }, CustomerInvalidPhoneError>> {
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
      return ok({ customer, created: false });
    }

    const phoneOwner = await this.customerRepository.findByPhone(dto.phone);
    if (phoneOwner) return err(new CustomerInvalidPhoneError(dto.phone));

    const customer = await this.customerRepository.save(
      Customer.create({ name: dto.name, email: dto.email, phone: dto.phone }),
    );
    return ok({ customer, created: true });
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Result<Customer, CustomerNotFoundError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;

    const customer = found.value;
    if (dto.name) customer.name = dto.name.trim();
    if (dto.email) customer.email = dto.email.trim().toLowerCase();
    if (dto.phone) customer.phone = dto.phone.trim();

    return ok(await this.customerRepository.save(customer));
  }

  async delete(id: string): Promise<Result<void, CustomerNotFoundError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;
    await this.customerRepository.delete(id);
    return ok(undefined);
  }
}
