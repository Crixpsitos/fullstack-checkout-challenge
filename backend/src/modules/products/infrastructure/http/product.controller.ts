import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { plainToInstance } from 'class-transformer';
import { type Request } from 'express';
import { ProductApplicationService } from '../../application/product.application.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { PaginatedResponseDto } from '../../../../shared/dto/paginated-response.dto';
import { Err } from '../../../../shared/result/result';
import {
  STORAGE_SERVICE,
  IStorageService,
  StorageFileInput,
} from '../../../../shared/storage/storage.service.port';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductApplicationService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  @Get()
  async findAll(
    @Query() filter: ProductFilterDto,
    @Req() req: Request,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const result = await this.productService.getAll(filter);
    const mapped = plainToInstance(ProductResponseDto, result.items, {
      excludeExtraneousValues: true,
    });
    return PaginatedResponseDto.fromResult({ ...result, items: mapped }, req);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    const result = await this.productService.getById(id);
    if (result instanceof Err)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: result.error.message,
        code: result.error.code,
      });
    return plainToInstance(ProductResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    let uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      const inputs: StorageFileInput[] = files.map(
        (f) => new StorageFileInput(f.buffer, f.originalname, f.mimetype),
      );
      uploadedUrls = await this.storageService.saveMany(inputs, 'products');
    }

    const images: string[] = [...uploadedUrls, ...(dto.imageUrls ?? [])];

    if (images.length === 0) {
      throw new BadRequestException(
        'Se requiere al menos una imagen (archivo o URL)',
      );
    }

    try {
      const product = await this.productService.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
        images,
      });
      return plainToInstance(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (uploadedUrls.length > 0) {
        await this.storageService.deleteMany(uploadedUrls);
      }
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const result = await this.productService.update(id, dto);
    if (result instanceof Err)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: result.error.message,
        code: result.error.code,
      });
    return plainToInstance(ProductResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.productService.delete(id);
    if (result instanceof Err)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: result.error.message,
        code: result.error.code,
      });
  }
}
