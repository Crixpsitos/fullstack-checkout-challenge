import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDeliveryDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;
}
