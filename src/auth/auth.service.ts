import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../common/entities/user.entity';
import { Restaurant } from '../common/entities/restaurant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';
import { RegisterCartOwnerDto } from './dto/register-cart-owner.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;

    // If role is provided, search with role filter
    // If role is not provided, search by email only
    const whereCondition = role 
      ? { email, role }
      : { email };

    const user = await this.userRepository.findOne({
      where: whereCondition,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    try {
      const token = this.jwtService.sign(payload);
      return {
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        },
      };
    } catch (error) {
      console.error('JWT Sign Error:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  async registerRestaurant(registerDto: RegisterRestaurantDto) {
    const { restaurantName, ownerName, email, phone, address, cuisine, capacity } = registerDto;

    // Check if restaurant email already exists
    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { email },
    });

    if (existingRestaurant) {
      throw new BadRequestException('Restaurant with this email already exists');
    }

    // Create restaurant
    const restaurant = this.restaurantRepository.create({
      name: restaurantName,
      email,
      phone,
      address,
      cuisine,
      capacity,
    });

    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    // Create admin user for the restaurant
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = this.userRepository.create({
      name: ownerName,
      email,
      password: hashedPassword,
      phone,
      role: UserRole.ADMIN,
      restaurantId: savedRestaurant.id,
    });

    await this.userRepository.save(adminUser);

    return {
      success: true,
      message: 'Restaurant registered successfully',
      restaurant: {
        id: savedRestaurant.id,
        name: savedRestaurant.name,
        email: savedRestaurant.email,
        status: savedRestaurant.status,
      },
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async registerSuperAdmin(registerDto: any) {
    const { name, email, phone, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create SuperAdmin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const superAdminUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(superAdminUser);

    // Generate JWT token
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };

    try {
      const token = this.jwtService.sign(payload);
      return {
        success: true,
        message: 'SuperAdmin registered successfully',
        token: token,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    } catch (error) {
      console.error('JWT Sign Error in registerSuperAdmin:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  async registerCartOwner(registerDto: RegisterCartOwnerDto) {
    const { name, email, password, phone, businessName, businessType, address } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new cart owner user
    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: UserRole.CART_OWNER,
      status: UserStatus.ACTIVE,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Generate JWT token
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      restaurantId: savedUser.restaurantId,
    };

    try {
      const token = this.jwtService.sign(payload);
      return {
        success: true,
        token: token,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          restaurantId: savedUser.restaurantId,
        },
      };
    } catch (error) {
      console.error('JWT Sign Error in registerCartOwner:', error);
      throw new Error('Failed to generate authentication token');
    }
  }
} 