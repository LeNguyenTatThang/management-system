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
import { ExportType } from '@prisma/client';

export class CreateExportItemDto {
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
  @IsPositive()
  unitId?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateExportDto {
  @IsOptional()
  @IsDateString()
  exportDate?: string;

  @IsOptional()
  @IsEnum(ExportType)
  exportType?: ExportType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExportItemDto)
  @IsNotEmpty({ message: 'Phải có ít nhất một mục xuất kho' })
  items: CreateExportItemDto[];
}
