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
import { AdjustmentType } from '@prisma/client';

export class CreateAdjustmentItemDto {
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

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  unitId: number;

  @IsNotEmpty({ message: 'Hướng điều chỉnh không được để trống' })
  @IsEnum(AdjustmentType, { message: 'Hướng điều chỉnh phải là INCREASE hoặc DECREASE' })
  direction: AdjustmentType;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateAdjustmentDto {
  @IsOptional()
  @IsDateString()
  adjustmentDate?: string;

  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdjustmentItemDto)
  @IsNotEmpty({ message: 'Phải có ít nhất một mục điều chỉnh' })
  items: CreateAdjustmentItemDto[];
}
