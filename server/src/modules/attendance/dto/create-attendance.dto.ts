import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsDateString({}, { message: 'date không hợp lệ (ISO 8601)' })
  date: string;

  @IsOptional()
  @IsString()
  note?: string;
}
