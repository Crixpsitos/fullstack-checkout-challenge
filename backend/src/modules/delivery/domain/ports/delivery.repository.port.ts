import { type Delivery } from '../entities/delivery.entity';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface IDeliveryRepository {
  save(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  findByCustomerId(customerId: string): Promise<Delivery | null>;
  findLatestByCustomerId(customerId: string): Promise<Delivery | null>;
  findAll(): Promise<Delivery[]>;
}
