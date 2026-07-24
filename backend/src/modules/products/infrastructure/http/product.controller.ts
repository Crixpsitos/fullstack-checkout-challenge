import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.getProductsUseCase.execute();
    return plainToInstance(ProductResponseDto, products, { excludeExtraneousValues: true });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.getProductByIdUseCase.execute(id);
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute(dto);
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
  }
}
