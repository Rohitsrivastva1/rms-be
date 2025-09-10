const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackendStatus() {
  try {
    console.log('🧪 Testing Backend Status...\n');

    // Test if backend is running
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running - connection refused');
    } else {
      console.log('❌ Backend error:', error.response?.data || error.message);
    }
  }
}

testBackendStatus();