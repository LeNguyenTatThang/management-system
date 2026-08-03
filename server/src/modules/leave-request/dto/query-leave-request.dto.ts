import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { LeaveRequestStatus } from '@prisma/client';

export class QueryLeaveRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  employeeId?: number;

  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
