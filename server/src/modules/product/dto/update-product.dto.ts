import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  costPrice?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  setupIds?: number[];
}
