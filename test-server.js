const axios = require('axios');

async function testServer() {
  try {
    console.log('🔍 Testing Server Connection...');
    
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Server is running!');
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('❌ Server not responding:');
    console.error('Error:', error.message);
  }
}

testServer();

