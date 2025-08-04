import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: any) {
    const { restaurantId, role, status } = query;
    
    // Mock implementation - in real app, this would query database
    const mockStaff = [
      {
        id: 1,
        name: 'John Chef',
        email: 'john.chef@restaurant.com',
        phone: '+91 9876543210',
        role: 'chef',
        status: 'active',
        restaurantId: 1,
        salary: 25000,
        rating: 4.5,
        performance: 85,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Sarah Waiter',
        email: 'sarah.waiter@restaurant.com',
        phone: '+91 9876543211',
        role: 'waiter',
        status: 'active',
        restaurantId: 1,
        salary: 18000,
        rating: 4.2,
        performance: 78,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Mike Manager',
        email: 'mike.manager@restaurant.com',
        phone: '+91 9876543212',
        role: 'manager',
        status: 'active',
        restaurantId: 1,
        salary: 35000,
        rating: 4.8,
        performance: 92,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Lisa Chef',
        email: 'lisa.chef@restaurant.com',
        phone: '+91 9876543213',
        role: 'chef',
        status: 'on_leave',
        restaurantId: 1,
        salary: 28000,
        rating: 4.6,
        performance: 88,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
      }
    ];

    let staff = mockStaff;

    // Filter by restaurantId
    if (restaurantId) {
      staff = staff.filter(s => s.restaurantId === parseInt(restaurantId));
    }

    // Filter by role
    if (role && role !== 'all') {
      staff = staff.filter(s => s.role === role);
    }

    // Filter by status
    if (status && status !== 'all') {
      staff = staff.filter(s => s.status === status);
    }

    return { staff };
  }

  async findById(id: number) {
    // Mock implementation - in real app, this would query database
    const mockStaff = [
      {
        id: 1,
        name: 'John Chef',
        email: 'john.chef@restaurant.com',
        phone: '+91 9876543210',
        role: 'chef',
        status: 'active',
        restaurantId: 1,
        salary: 25000,
        rating: 4.5,
        performance: 85,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Sarah Waiter',
        email: 'sarah.waiter@restaurant.com',
        phone: '+91 9876543211',
        role: 'waiter',
        status: 'active',
        restaurantId: 1,
        salary: 18000,
        rating: 4.2,
        performance: 78,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ];
    
    const staff = mockStaff.find(s => s.id === id);
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  async create(createStaffDto: any) {
    // Mock implementation - in real app, this would save to database
    const newStaff = {
      id: Date.now(),
      ...createStaffDto,
      rating: 0,
      performance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating staff member:', newStaff);
    return newStaff;
  }

  async update(id: number, updateStaffDto: any) {
    // Mock implementation - in real app, this would update in database
    const existingStaff = await this.findById(id);
    const updatedStaff = {
      ...existingStaff,
      ...updateStaffDto,
      id: id,
      updatedAt: new Date()
    };
    
    console.log('Updating staff member:', updatedStaff);
    return updatedStaff;
  }

  async delete(id: number) {
    // Mock implementation - in real app, this would delete from database
    const staff = await this.findById(id);
    console.log('Deleting staff member:', staff);
    return { message: 'Staff member deleted successfully' };
  }

  async findByRestaurant(restaurantId: number) {
    // Mock implementation - in real app, this would query database
    const mockStaff = [
      {
        id: 1,
        name: 'John Chef',
        email: 'john.chef@restaurant.com',
        phone: '+91 9876543210',
        role: 'chef',
        status: 'active',
        restaurantId: 1,
        salary: 25000,
        rating: 4.5,
        performance: 85,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Sarah Waiter',
        email: 'sarah.waiter@restaurant.com',
        phone: '+91 9876543211',
        role: 'waiter',
        status: 'active',
        restaurantId: 1,
        salary: 18000,
        rating: 4.2,
        performance: 78,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ];

    const staff = mockStaff.filter(s => s.restaurantId === restaurantId);
    return { staff };
  }

  async getStats(query: any) {
    const { restaurantId } = query;
    
    // Mock implementation - in real app, this would calculate from database
    const mockStaff = [
      { role: 'chef', status: 'active', restaurantId: 1 },
      { role: 'waiter', status: 'active', restaurantId: 1 },
      { role: 'manager', status: 'active', restaurantId: 1 },
      { role: 'chef', status: 'on_leave', restaurantId: 1 },
      { role: 'waiter', status: 'inactive', restaurantId: 1 }
    ];

    const staff = mockStaff.filter(s => s.restaurantId === parseInt(restaurantId));

    const stats = {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === 'active').length,
      chefs: staff.filter(s => s.role === 'chef').length,
      waiters: staff.filter(s => s.role === 'waiter').length,
      managers: staff.filter(s => s.role === 'manager').length,
      onLeave: staff.filter(s => s.status === 'on_leave').length,
      inactive: staff.filter(s => s.status === 'inactive').length
    };

    return stats;
  }
} 