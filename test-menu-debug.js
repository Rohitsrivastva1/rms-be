const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMenuDebug() {
  try {
    console.log('🧪 Testing Menu Management (Debug)...\n');

    // 1. Login as cart owner
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    const cartId = 7;

    // 2. Create a category first
    console.log('\n2. Creating category...');
    const categoryResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      name: 'Test Category',
      description: 'Test description',
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

    // 3. Try to create a menu item with minimal data
    console.log('\n3. Creating menu item with minimal data...');
    try {
      const itemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
        name: 'Test Item',
        price: 10.99,
        categoryId: categoryId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Menu item created:', itemResponse.data.name);
    } catch (error) {
      console.error('❌ Error creating menu item:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMenuDebug();
