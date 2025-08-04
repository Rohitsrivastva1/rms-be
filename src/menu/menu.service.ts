import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuCategory } from '../common/entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
  ) {}

  async getCategories() {
    return {
      categories: Object.values(MenuCategory).map(category => ({
        value: category,
        label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    };
  }

  async findAll(query: any) {
    const { category, search, available, restaurantId } = query;
    
    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    if (restaurantId) {
      queryBuilder.andWhere('menu.restaurantId = :restaurantId', { restaurantId });
    }

    if (category && category !== 'all') {
      queryBuilder.andWhere('menu.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        '(menu.name ILIKE :search OR menu.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (available !== undefined) {
      queryBuilder.andWhere('menu.available = :available', { 
        available: available === 'true' 
      });
    }

    const items = await queryBuilder
      .orderBy('menu.category', 'ASC')
      .addOrderBy('menu.name', 'ASC')
      .getMany();

    return { items };
  }

  async findById(id: number) {
    const item = await this.menuRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  async create(createMenuItemDto: any) {
    console.log('Received createMenuItemDto:', createMenuItemDto);
    
    // Validate category
    const validCategories = Object.values(MenuCategory);
    if (!validCategories.includes(createMenuItemDto.category)) {
      throw new Error(`Invalid category: ${createMenuItemDto.category}. Valid categories are: ${validCategories.join(', ')}`);
    }
    
    const newItem = this.menuRepository.create({
      ...createMenuItemDto,
      image: createMenuItemDto.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center',
    });
    
    console.log('Creating menu item with data:', newItem);
    const savedItem = await this.menuRepository.save(newItem);
    console.log('Created menu item:', savedItem);
    return savedItem;
  }

  async update(id: number, updateMenuItemDto: any) {
    const existingItem = await this.findById(id);
    const updatedItem = this.menuRepository.merge(existingItem, updateMenuItemDto);
    const savedItem = await this.menuRepository.save(updatedItem);
    
    console.log('Updating menu item:', savedItem);
    return savedItem;
  }

  async delete(id: number) {
    const menuItem = await this.findById(id);
    await this.menuRepository.remove(menuItem);
    console.log('Deleting menu item:', menuItem);
    return { message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.findById(id);
    menuItem.available = !menuItem.available;
    
    const savedItem = await this.menuRepository.save(menuItem);
    console.log('Toggling availability for menu item:', savedItem);
    return savedItem;
  }

  async getMenuByRestaurant(restaurantId: number) {
    const items = await this.menuRepository.find({
      where: { restaurantId, available: true },
      order: { category: 'ASC', name: 'ASC' }
    });

    // Group by category
    const menuByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      restaurant: {
        name: 'Demo Restaurant', // This should come from restaurant service
        logo: 'https://via.placeholder.com/150',
        description: 'Authentic Indian Cuisine'
      },
      menu: menuByCategory
    };
  }
} 