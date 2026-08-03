import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsDateString({}, { message: 'startDateTime không hợp lệ (ISO 8601)' })
  startDateTime: string;

  @IsDateString({}, { message: 'endDateTime không hợp lệ (ISO 8601)' })
  endDateTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
