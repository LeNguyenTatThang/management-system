import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, { message: 'status không hợp lệ' })
  status?: AttendanceStatus;
}
