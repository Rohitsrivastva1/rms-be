const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimple() {
  try {
    console.log('🧪 Testing Simple API...\n');

    // Test login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user.name);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

testSimple();
