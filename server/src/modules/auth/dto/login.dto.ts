import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email không hợp lệ' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password là bắt buộc' })
  @MinLength(6, { message: 'password tối thiểu 6 ký tự' })
  password: string;
}