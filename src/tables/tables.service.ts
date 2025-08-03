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
      { id: 1, tableNumber: 1, capacity: 4, status: 'available', restaurantId: 1 },
      { id: 2, tableNumber: 2, capacity: 6, status: 'occupied', restaurantId: 1 },
      { id: 3, tableNumber: 3, capacity: 2, status: 'available', restaurantId: 1 },
      { id: 4, tableNumber: 4, capacity: 8, status: 'reserved', restaurantId: 1 },
      { id: 5, tableNumber: 5, capacity: 4, status: 'available', restaurantId: 1 },
      { id: 6, tableNumber: 6, capacity: 6, status: 'occupied', restaurantId: 1 },
    ].filter(table => table.restaurantId === parseInt(restaurantId));

    return { tables };
  }

  async findById(id: number) {
    // Mock data - in real app, this would come from database
    const table = { id, tableNumber: id, capacity: 4, status: 'available', restaurantId: 1 };
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
      tableNumber: table.tableNumber,
      qrCode: `https://example.com/table/${table.tableNumber}`,
      qrData: `table:${table.tableNumber}:restaurant:${table.restaurantId}`
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