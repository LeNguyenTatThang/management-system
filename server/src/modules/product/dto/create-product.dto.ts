import { Type } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên món không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Giá bán không được để trống' })
  price: number;

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
