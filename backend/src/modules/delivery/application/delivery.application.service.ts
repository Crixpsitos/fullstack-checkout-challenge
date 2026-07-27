import { Inject, Injectable } from '@nestjs/common';
import { Delivery } from '../domain/entities/delivery.entity';
import {
  type IDeliveryRepository,
  DELIVERY_REPOSITORY,
} from '../domain/ports/delivery.repository.port';
import { CreateDeliveryDto } from '../infrastructure/http/dto/create-delivery.dto';

@Injectable()
export class DeliveryApplicationService {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async getById(id: string): Promise<Delivery | null> {
    return this.deliveryRepository.findById(id);
  }

  async getByCustomerId(customerId: string): Promise<Delivery | null> {
    return this.deliveryRepository.findByCustomerId(customerId);
  }

  async create(dto: CreateDeliveryDto): Promise<Delivery> {
    return this.deliveryRepository.save(
      Delivery.create({
        customerId: dto.customerId,
        address: dto.address.trim(),
        city: dto.city.trim(),
        country: dto.country.trim(),
      }),
    );
  }
}
