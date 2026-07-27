import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryDto {
  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @MinLength(2)
  country!: string;
}

export class CreateTransactionDto {
  @IsUUID('4')
  idempotencyKey!: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsInt()
  @IsPositive()
  amountInCents!: number;

  @IsUUID()
  productId!: string;

  @IsUUID()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @IsString()
  @IsNotEmpty()
  acceptanceToken!: string;

  @IsEmail()
  customerEmail!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;
}
