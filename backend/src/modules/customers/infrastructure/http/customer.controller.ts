import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { Err } from 'src/shared/result/result';
import { CustomerApplicationService } from '../../application/customer.application.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomerInvalidPhoneError } from '../../domain/errors/customer.errors';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerApplicationService) {}

  @Get()
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerService.getAll();
    return plainToInstance(CustomerResponseDto, customers, { excludeExtraneousValues: true });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerResponseDto> {
    const result = await this.customerService.getById(id);
    if (result instanceof Err)
      throw new NotFoundException({ statusCode: HttpStatus.NOT_FOUND, message: result.error.message, code: result.error.code });
    return plainToInstance(CustomerResponseDto, result.value, { excludeExtraneousValues: true });
  }

  @Post()
  async createOrUpdate(
    @Body() dto: CreateCustomerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomerResponseDto> {
    const result = await this.customerService.createOrUpdate(dto);
    if (result instanceof Err)
      throw new ConflictException({ statusCode: HttpStatus.CONFLICT, message: result.error.message, code: result.error.code });

    const { customer, created } = result.value;
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: true });
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const result = await this.customerService.update(id, dto);
    if (result instanceof Err)
      throw new NotFoundException({ statusCode: HttpStatus.NOT_FOUND, message: result.error.message, code: result.error.code });
    return plainToInstance(CustomerResponseDto, result.value, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.customerService.delete(id);
    if (result instanceof Err)
      throw new NotFoundException({ statusCode: HttpStatus.NOT_FOUND, message: result.error.message, code: result.error.code });
  }
}
