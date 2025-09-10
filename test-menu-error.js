const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMenuError() {
  try {
    console.log('🧪 Testing Menu Error...\n');

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

    // 3. Try to create a menu item
    console.log('\n3. Creating menu item...');
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
    console.error('❌ Full error response:', JSON.stringify(error.response?.data, null, 2));
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
  }
}

testMenuError();
