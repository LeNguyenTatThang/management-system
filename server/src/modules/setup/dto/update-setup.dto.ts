import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSetupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
