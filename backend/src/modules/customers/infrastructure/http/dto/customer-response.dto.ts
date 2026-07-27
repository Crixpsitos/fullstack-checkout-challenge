import { Expose, Type } from 'class-transformer';

export class LatestDeliveryDto {
  @Expose() id!: string;
  @Expose() address!: string;
  @Expose() city!: string;
  @Expose() country!: string;
  @Expose() createdAt!: Date;
}

export class CustomerResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() email!: string;
  @Expose() phone!: string;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Expose()
  @Type(() => LatestDeliveryDto)
  latestDelivery!: LatestDeliveryDto | null;
}
