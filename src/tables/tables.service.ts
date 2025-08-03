import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from '../common/entities/table.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async findByRestaurant(query: any) {
    const { restaurantId } = query;
    
    // Mock data for tables
    // In a real application, this would come from the database
    const tables = [
      { 
        id: 1, 
        name: 'Table 1', 
        number: 'T1', 
        capacity: 4, 
        area: 'Main Hall',
        status: 'active', 
        restaurantId: 1 
      },
      { 
        id: 2, 
        name: 'Table 2', 
        number: 'T2', 
        capacity: 6, 
        area: 'VIP Section',
        status: 'active', 
        restaurantId: 1 
      },
      { 
        id: 3, 
        name: 'Table 3', 
        number: 'T3', 
        capacity: 2, 
        area: 'Main Hall',
        status: 'inactive', 
        restaurantId: 1 
      },
      { 
        id: 4, 
        name: 'Table 4', 
        number: 'T4', 
        capacity: 8, 
        area: 'Outdoor',
        status: 'active', 
        restaurantId: 1 
      },
      { 
        id: 5, 
        name: 'Table 5', 
        number: 'T5', 
        capacity: 4, 
        area: 'AC Room',
        status: 'active', 
        restaurantId: 1 
      },
      { 
        id: 6, 
        name: 'Table 6', 
        number: 'T6', 
        capacity: 6, 
        area: 'Bar Area',
        status: 'active', 
        restaurantId: 1 
      },
    ].filter(table => table.restaurantId === parseInt(restaurantId));

    return { tables };
  }

  async findById(id: number) {
    // Mock data - in real app, this would come from database
    const table = { 
      id, 
      name: `Table ${id}`, 
      number: `T${id}`, 
      capacity: 4, 
      area: 'Main Hall',
      status: 'active', 
      restaurantId: 1 
    };
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async create(createTableDto: any) {
    // Mock implementation
    const table = { id: Date.now(), ...createTableDto };
    return table;
  }

  async update(id: number, updateTableDto: any) {
    // Mock implementation
    const table = await this.findById(id);
    return { ...table, ...updateTableDto };
  }

  async delete(id: number) {
    // Mock implementation
    await this.findById(id);
    return { message: 'Table deleted successfully' };
  }

  async updateStatus(id: number, updateStatusDto: any) {
    // Mock implementation
    const table = await this.findById(id);
    return { ...table, status: updateStatusDto.status };
  }

  async generateQRCode(id: number) {
    // Mock implementation
    const table = await this.findById(id);
    return {
      tableId: id,
      tableNumber: table.number,
      qrCode: `https://example.com/table/${table.number}`,
      qrData: `table:${table.number}:restaurant:${table.restaurantId}`
    };
  }

  async getQRCode(tableNumber: string) {
    // Mock implementation
    return {
      tableNumber,
      qrCode: `https://example.com/table/${tableNumber}`,
      qrData: `table:${tableNumber}:restaurant:1`
    };
  }
} 