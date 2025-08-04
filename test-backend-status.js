const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function checkBackendStatus() {
  try {
    console.log('🔍 Checking backend status...');
    
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running!');
    console.log('📊 Status:', response.status);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running. Please start it with: npm run start:dev');
    } else {
      console.log('⚠️ Backend responded with error:', error.response?.status || error.message);
    }
  }
}

checkBackendStatus(); 