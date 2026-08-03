import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
