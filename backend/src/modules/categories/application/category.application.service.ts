import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../domain/entities/category.entity';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../domain/ports/category.repository.port';
import { CreateCategoryDto } from '../infrastructure/http/dto/create-category.dto';
import { UpdateCategoryDto } from '../infrastructure/http/dto/update-category.dto';
import { Result, ok, err, Err } from '../../../shared/result/result';
import {
  CategoryError,
  CategoryNotFoundError,
  CategorySlugConflictError,
} from '../domain/errors/category.errors';

@Injectable()
export class CategoryApplicationService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getById(id: number): Promise<Result<Category, CategoryNotFoundError>> {
    const category = await this.categoryRepository.findById(id);
    if (!category) return err(new CategoryNotFoundError(id));
    return ok(category);
  }

  async create(
    dto: CreateCategoryDto,
  ): Promise<Result<Category, CategorySlugConflictError>> {
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) return err(new CategorySlugConflictError(dto.slug));
    const category = Category.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
    });
    return ok(await this.categoryRepository.save(category));
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Result<Category, CategoryError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;

    const category = found.value;
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlug(dto.slug);
      if (existing) return err(new CategorySlugConflictError(dto.slug));
    }

    if (dto.name) category.name = dto.name.trim();
    if (dto.slug) category.slug = dto.slug.trim().toLowerCase();
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return ok(await this.categoryRepository.save(category));
  }

  async delete(id: number): Promise<Result<void, CategoryNotFoundError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;
    await this.categoryRepository.delete(id);
    return ok(undefined);
  }
}
