import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { EmployeeStatus, Gender, SalaryType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'name là bắt buộc' })
  name: string;

  @IsEmail({}, { message: 'email không hợp lệ' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dateOfBirth không hợp lệ' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(Gender, { message: 'gender không hợp lệ' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  citizenId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  @MinLength(6, { message: 'password tối thiểu 6 ký tự' })
  password: string;

  @Type(() => Number)
  @IsInt({ message: 'roleId không hợp lệ' })
  @IsPositive({ message: 'roleId phải lớn hơn 0' })
  roleId: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'startDate không hợp lệ' })
  startDate?: Date;

  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'status không hợp lệ' })
  status?: EmployeeStatus;

  @IsOptional()
  @IsEnum(SalaryType, { message: 'salaryType không hợp lệ' })
  salaryType?: SalaryType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'salary phải là số' })
  @Min(0, { message: 'salary không được nhỏ hơn 0' })
  salary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'monthlyLeaveDays phải là số nguyên' })
  @Min(0, { message: 'monthlyLeaveDays không được nhỏ hơn 0' })
  monthlyLeaveDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'remainingLeaveDays phải là số nguyên' })
  @Min(0, { message: 'remainingLeaveDays không được nhỏ hơn 0' })
  remainingLeaveDays?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
