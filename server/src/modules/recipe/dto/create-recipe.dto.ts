import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RecipeIngredientDto {
  @IsNotEmpty({ message: 'Nguyên liệu không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNotEmpty({ message: 'Định lượng không được để trống' })
  @Type(() => Number)
  @IsPositive({ message: 'Định lượng phải lớn hơn 0' })
  quantity: number;

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  unitId: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateRecipeDto {
  @IsNotEmpty({ message: 'Tên công thức không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
