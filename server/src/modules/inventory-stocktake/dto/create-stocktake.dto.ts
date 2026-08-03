import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

export class CreateStocktakeItemDto {
  @IsNotEmpty({ message: 'Mã nguyên liệu không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  unitId: number;

  @IsNotEmpty({ message: 'Tồn thực tế không được để trống' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Tồn thực tế phải lớn hơn hoặc bằng 0' })
  actualQuantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateStocktakeDto {
  @IsOptional()
  @IsDateString()
  stocktakeDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStocktakeItemDto)
  @IsNotEmpty({ message: 'Phải có ít nhất một mục kiểm kê' })
  items: CreateStocktakeItemDto[];
}
