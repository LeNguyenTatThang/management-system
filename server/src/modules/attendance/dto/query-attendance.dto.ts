import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class QueryAttendanceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  employeeId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
