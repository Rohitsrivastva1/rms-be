const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function createCartForOwner() {
  try {
    console.log('🧪 Creating Cart for Cart Owner...\n');

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

    // 2. Create a cart for this owner
    console.log('\n2. Creating cart for owner...');
    const cartData = {
      name: 'John\'s Food Cart',
      description: 'A delicious food cart serving fresh meals',
      location: 'Downtown Market',
      theme: 'modern'
    };

    const createResponse = await axios.post(`${BASE_URL}/cart/owner/carts`, cartData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Cart created successfully');
    console.log('Cart ID:', createResponse.data.id);
    console.log('Cart Name:', createResponse.data.name);
    console.log('Owner ID:', createResponse.data.ownerId);

    // 3. Verify the cart appears in owner's cart list
    console.log('\n3. Verifying cart appears in owner\'s list...');
    const cartsResponse = await axios.get(`${BASE_URL}/cart/owner/carts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const carts = cartsResponse.data.carts || [];
    console.log(`✅ Found ${carts.length} carts for owner ${user.id}`);
    
    if (carts.length > 0) {
      carts.forEach((cart, index) => {
        console.log(`\nCart ${index + 1}:`);
        console.log(`  ID: ${cart.id}`);
        console.log(`  Name: ${cart.name}`);
        console.log(`  Owner ID: ${cart.ownerId}`);
        console.log(`  Status: ${cart.status}`);
        console.log(`  QR Code: ${cart.qrCode ? 'Generated' : 'Not generated'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createCartForOwner();
