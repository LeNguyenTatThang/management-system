import { IsOptional, IsString, IsDateString, IsArray, ValidateNested, IsNotEmpty, IsInt, IsPositive, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferItemDto {
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
  @IsString()
  note?: string;
}

export class CreateTransferDto {
  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  @IsNotEmpty({ message: 'Phải có ít nhất một mục chuyển kho' })
  items: CreateTransferItemDto[];
}
