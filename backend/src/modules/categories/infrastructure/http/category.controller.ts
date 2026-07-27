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
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoryApplicationService } from '../../application/category.application.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Err } from '../../../../shared/result/result';
import { CategoryNotFoundError } from '../../domain/errors/category.errors';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryApplicationService) {}

  @Get()
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryService.getAll();
    return plainToInstance(CategoryResponseDto, categories, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto> {
    const result = await this.categoryService.getById(id);
    if (result instanceof Err)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: result.error.message,
        code: result.error.code,
      });
    return plainToInstance(CategoryResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const result = await this.categoryService.create(dto);
    if (result instanceof Err)
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: result.error.message,
        code: result.error.code,
      });
    return plainToInstance(CategoryResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const result = await this.categoryService.update(id, dto);
    if (result instanceof Err) {
      if (result.error instanceof CategoryNotFoundError)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: result.error.message,
          code: result.error.code,
        });
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: result.error.message,
        code: result.error.code,
      });
    }
    return plainToInstance(CategoryResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.categoryService.delete(id);
    if (result instanceof Err)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: result.error.message,
        code: result.error.code,
      });
  }
}
