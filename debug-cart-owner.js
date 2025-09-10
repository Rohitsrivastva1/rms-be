const axios = require('axios');

async function debugCartOwnerRegistration() {
  try {
    console.log('🔍 Debugging Cart Owner Registration...\n');

    // Simple test data
    const simpleData = {
      name: 'Test Cart Owner',
      email: 'testcart@example.com',
      password: 'password123'
    };

    console.log('Testing with simple data:', simpleData);

    const response = await axios.post('http://localhost:3000/auth/register-cart-owner', simpleData);
    console.log('✅ SUCCESS!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    if (error.response?.data?.message?.includes('Internal server error')) {
      console.log('\n🔍 This is likely a server-side error. Check the backend logs.');
    }
  }
}

debugCartOwnerRegistration();
