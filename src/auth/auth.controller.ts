import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-restaurant')
  @ApiOperation({ summary: 'Register new restaurant (SuperAdmin only)' })
  @ApiResponse({ status: 201, description: 'Restaurant registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerRestaurant(@Body() registerDto: RegisterRestaurantDto) {
    return this.authService.registerRestaurant(registerDto);
  }

  @Post('register-superadmin')
  @ApiOperation({ summary: 'Register new SuperAdmin account' })
  @ApiResponse({ status: 201, description: 'SuperAdmin registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerSuperAdmin(@Body() registerDto: any) {
    return this.authService.registerSuperAdmin(registerDto);
  }
} 