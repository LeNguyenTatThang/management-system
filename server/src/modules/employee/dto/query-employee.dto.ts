import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class QueryEmployeeDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'status không hợp lệ' })
  status?: EmployeeStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'roleId không hợp lệ' })
  roleId?: number;
}
