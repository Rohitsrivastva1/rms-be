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
    
    // For now, return mock data since the database might be empty
    const mockItems = [
      {
        id: 1,
        name: 'Butter Chicken',
        description: 'Creamy and rich butter chicken curry',
        price: 450,
        category: 'main_course',
        available: true,
        restaurantId: 1,
        image: 'https://via.placeholder.com/300x200?text=Butter+Chicken',
        veg: false,
        spicyLevel: 2
      },
      {
        id: 2,
        name: 'Biryani',
        description: 'Fragrant rice dish with aromatic spices',
        price: 350,
        category: 'main_course',
        available: true,
        restaurantId: 1,
        image: 'https://via.placeholder.com/300x200?text=Biryani',
        veg: false,
        spicyLevel: 3
      },
      {
        id: 3,
        name: 'Naan',
        description: 'Soft and fluffy Indian bread',
        price: 50,
        category: 'side_dish',
        available: true,
        restaurantId: 1,
        image: 'https://via.placeholder.com/300x200?text=Naan',
        veg: true,
        spicyLevel: 0
      },
      {
        id: 4,
        name: 'Dal Makhani',
        description: 'Creamy black lentils',
        price: 200,
        category: 'main_course',
        available: true,
        restaurantId: 1,
        image: 'https://via.placeholder.com/300x200?text=Dal+Makhani',
        veg: true,
        spicyLevel: 1
      }
    ];

    // Filter by restaurantId if provided
    let items = mockItems;
    if (restaurantId) {
      items = items.filter(item => item.restaurantId === parseInt(restaurantId));
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      items = items.filter(item => item.category === category);
    }

    // Filter by search term if provided
    if (search) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by availability if provided
    if (available !== undefined) {
      items = items.filter(item => item.available === (available === 'true'));
    }

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
    const menuItem = this.menuRepository.create(createMenuItemDto);
    return this.menuRepository.save(menuItem);
  }

  async update(id: number, updateMenuItemDto: any) {
    const menuItem = await this.findById(id);
    Object.assign(menuItem, updateMenuItemDto);
    return this.menuRepository.save(menuItem);
  }

  async delete(id: number) {
    const menuItem = await this.findById(id);
    await this.menuRepository.remove(menuItem);
    return { message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.findById(id);
    menuItem.available = !menuItem.available;
    return this.menuRepository.save(menuItem);
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