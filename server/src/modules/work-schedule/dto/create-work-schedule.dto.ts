import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateWorkScheduleDto {
  @Type(() => Number)
  @IsInt({ message: 'employeeId không hợp lệ' })
  @IsPositive({ message: 'employeeId phải lớn hơn 0' })
  employeeId: number;

  @Type(() => Date)
  @IsDate({ message: 'date không hợp lệ' })
  date: Date;

  @Type(() => Number)
  @IsInt({ message: 'shiftId không hợp lệ' })
  @IsPositive({ message: 'shiftId phải lớn hơn 0' })
  shiftId: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'checkIn không hợp lệ' })
  checkIn?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'checkOut không hợp lệ' })
  checkOut?: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
