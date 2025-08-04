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
    
    const tables = await this.tableRepository.find({
      where: { restaurantId: parseInt(restaurantId) },
      order: { tableNumber: 'ASC' }
    });

    return { tables };
  }

  async findById(id: number) {
    const table = await this.tableRepository.findOne({
      where: { id }
    });
    
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async create(createTableDto: any) {
    console.log('Creating table with data:', createTableDto);
    
    const newTable = this.tableRepository.create({
      ...createTableDto,
      restaurantId: parseInt(createTableDto.restaurantId),
      tableNumber: createTableDto.tableNumber || `T${Date.now()}`,
      status: createTableDto.status || 'available'
    });
    
    const savedTable = await this.tableRepository.save(newTable);
    console.log('Created table:', savedTable);
    return savedTable;
  }

  async update(id: number, updateTableDto: any) {
    console.log('Updating table with data:', updateTableDto);
    
    const table = await this.findById(id);
    
    Object.assign(table, updateTableDto);
    const updatedTable = await this.tableRepository.save(table);
    
    console.log('Updated table:', updatedTable);
    return updatedTable;
  }

  async delete(id: number) {
    const table = await this.findById(id);
    await this.tableRepository.remove(table);
    return { message: 'Table deleted successfully' };
  }

  async updateStatus(id: number, updateStatusDto: any) {
    const table = await this.findById(id);
    table.status = updateStatusDto.status;
    return await this.tableRepository.save(table);
  }

  async generateQRCode(id: number) {
    const table = await this.findById(id);
    
    // Generate QR code data with geofencing
    const qrData = {
      tableId: table.id,
      tableNumber: table.tableNumber,
      restaurantId: table.restaurantId,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/menu?table=${table.tableNumber}&restaurantId=${table.restaurantId}`,
      geofence: {
        latitude: 28.6139, // Default coordinates (can be customized per restaurant)
        longitude: 77.2090,
        radius: 100 // 100 meters radius
      }
    };
    
    // Update table with QR data
    table.qrData = JSON.stringify(qrData);
    table.qrCode = `QR_${table.tableNumber}_${Date.now()}`;
    
    const updatedTable = await this.tableRepository.save(table);
    
    return {
      table: updatedTable,
      qrData: qrData
    };
  }

  async getQRCode(tableNumber: string) {
    const table = await this.tableRepository.findOne({
      where: { tableNumber }
    });
    
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    
    if (!table.qrData) {
      // Generate QR data if not exists
      const qrData = {
        tableId: table.id,
        tableNumber: table.tableNumber,
        restaurantId: table.restaurantId,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/menu?table=${table.tableNumber}&restaurantId=${table.restaurantId}`,
        geofence: {
          latitude: 28.6139,
          longitude: 77.2090,
          radius: 100
        }
      };
      
      table.qrData = JSON.stringify(qrData);
      table.qrCode = `QR_${table.tableNumber}_${Date.now()}`;
      await this.tableRepository.save(table);
      
      return {
        table: table,
        qrData: qrData
      };
    }
    
    return {
      table: table,
      qrData: JSON.parse(table.qrData)
    };
  }
} 