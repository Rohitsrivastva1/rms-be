const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCartOwnerAPI() {
  try {
    console.log('🧪 Testing Cart Owner API...\n');

    // 1. Login as cart owner
    console.log('1. Logging in as cart owner...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
    console.log('Token:', token.substring(0, 50) + '...\n');

    // 2. Get owner carts
    console.log('2. Getting owner carts...');
    const cartsResponse = await axios.get(`${BASE_URL}/cart/owner/carts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Carts fetched successfully');
    console.log('Response:', JSON.stringify(cartsResponse.data, null, 2));

    // 3. Check if carts are filtered by owner
    const carts = cartsResponse.data.carts || [];
    console.log(`\n📊 Found ${carts.length} carts`);
    
    if (carts.length > 0) {
      carts.forEach((cart, index) => {
        console.log(`\nCart ${index + 1}:`);
        console.log(`  ID: ${cart.id}`);
        console.log(`  Name: ${cart.name}`);
        console.log(`  Owner ID: ${cart.ownerId}`);
        console.log(`  Owner Name: ${cart.owner?.name || 'N/A'}`);
        console.log(`  Status: ${cart.status}`);
      });
    } else {
      console.log('ℹ️  No carts found for this owner');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCartOwnerAPI();
