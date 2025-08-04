const axios = require('axios');

async function testBackendStatus() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Backend Status...\n');

    // Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await axios.get(`${baseURL}/health`, { timeout: 5000 });
      console.log('✅ Backend is running:', response.status);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend is not running (Connection refused)');
        console.log('💡 Please start the backend with: npm run start:dev');
        return;
      }
      console.log('❌ Health check failed:', error.message);
    }

    // Test menu endpoint (public)
    console.log('\n2️⃣ Testing menu endpoint...');
    try {
      const response = await axios.get(`${baseURL}/menu?restaurantId=1`, { timeout: 5000 });
      console.log('✅ Menu API:', response.status);
    } catch (error) {
      console.log('❌ Menu API failed:', error.response?.status || error.message);
    }

    // Test auth endpoint
    console.log('\n3️⃣ Testing auth endpoint...');
    try {
      const response = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@restaurant.com',
        password: 'password123'
      }, { timeout: 5000 });
      console.log('✅ Auth API:', response.status);
    } catch (error) {
      console.log('❌ Auth API failed:', error.response?.status || error.message);
    }

    console.log('\n🎉 Backend status test completed!');
    
  } catch (error) {
    console.error('❌ Backend status test failed:', error.message);
  }
}

testBackendStatus(); 