import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSetupDto {
  @IsNotEmpty({ message: 'Tên setup không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
