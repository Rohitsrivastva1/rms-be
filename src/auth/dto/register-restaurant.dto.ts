import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsNumber, Min, Matches } from 'class-validator';

export class RegisterRestaurantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[0-9]{10,15}$/, {
    message: 'Phone number must be a valid number with 10-15 digits',
  })
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cuisine: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  capacity: number;
} 