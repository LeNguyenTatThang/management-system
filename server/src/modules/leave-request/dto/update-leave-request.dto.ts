import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsDateString({}, { message: 'startDateTime không hợp lệ (ISO 8601)' })
  startDateTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDateTime không hợp lệ (ISO 8601)' })
  endDateTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
