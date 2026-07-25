import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}
