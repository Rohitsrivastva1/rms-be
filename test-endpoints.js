const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('🔍 Testing API Endpoints...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3000');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }

    // Test 2: Check auth endpoints
    console.log('\n2. Testing auth endpoints...');
    try {
      const authResponse = await axios.get('http://localhost:3000/auth');
      console.log('✅ Auth endpoint exists');
    } catch (error) {
      console.log('❌ Auth endpoint error:', error.response?.status, error.response?.data);
    }

    // Test 3: Test login endpoint
    console.log('\n3. Testing login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/auth/login', {
        email: 'test@gmail.com',
        password: 'admin123'
      });
      console.log('✅ Login endpoint works');
    } catch (error) {
      console.log('❌ Login error:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Test cart owner registration
    console.log('\n4. Testing cart owner registration...');
    try {
      const cartOwnerResponse = await axios.post('http://localhost:3000/auth/register-cart-owner', {
        name: 'Test Cart Owner',
        email: 'testcart2@example.com',
        password: 'password123'
      });
      console.log('✅ Cart Owner registration works!');
      console.log('Response:', cartOwnerResponse.data);
    } catch (error) {
      console.log('❌ Cart Owner registration error:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data);
      console.log('Error details:', error.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testEndpoints();
