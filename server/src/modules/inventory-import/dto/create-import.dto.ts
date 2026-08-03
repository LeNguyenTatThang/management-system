import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImportStatus } from '@prisma/client';

export class CreateImportItemDto {
  @IsNotEmpty({ message: 'Mã nguyên liệu không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unitId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  unitPrice?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateImportDto {
  @IsOptional()
  @IsDateString()
  importDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImportItemDto)
  @IsNotEmpty({ message: 'Phải có ít nhất một mục nhập kho' })
  items: CreateImportItemDto[];
}
