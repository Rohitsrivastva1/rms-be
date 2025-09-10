import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsPhoneNumber, MinLength } from 'class-validator';

export class RegisterCartOwnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;
}
