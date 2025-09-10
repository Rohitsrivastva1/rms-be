const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackendSimple() {
  try {
    console.log('🧪 Testing Backend Simple...\n');

    // Test if backend is running
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Backend is running:', response.data);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running - connection refused');
    } else {
      console.log('❌ Backend error:', error.response?.data || error.message);
    }
  }
}

testBackendSimple();
