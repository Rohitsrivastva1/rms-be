const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMenuSimple() {
  try {
    console.log('🧪 Testing Menu Management (Simple)...\n');

    // 1. Login as cart owner
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    const cartId = 7;

    // 2. Create a category
    console.log('\n2. Creating category...');
    const categoryResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      name: 'Appetizers',
      description: 'Start your meal right',
      sortOrder: 1,
      isActive: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Category created:', categoryResponse.data.name);
    const categoryId = categoryResponse.data.id;

    // 3. Create a menu item
    console.log('\n3. Creating menu item...');
    const itemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing',
      price: 8.99,
      categoryId: categoryId,
      isAvailable: true,
      isVegetarian: true,
      isSpicy: false,
      preparationTime: 10,
      sortOrder: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Menu item created:', itemResponse.data.name);

    // 4. Get all menu items
    console.log('\n4. Getting all menu items...');
    const itemsResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Menu items:', itemsResponse.data.menuItems.length, 'items found');

    console.log('\n🎉 Menu management is working!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMenuSimple();
