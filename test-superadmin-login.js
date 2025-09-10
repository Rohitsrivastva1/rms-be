const axios = require('axios');

async function testSuperAdminLogin() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing SuperAdmin Login...');
    console.log('📡 API Base URL:', baseURL);
    
    // Test login endpoint
    const loginData = {
      email: 'superadmin@platform.com',
      password: 'superadmin123',
      role: 'super_admin'
    };

    console.log('📤 Sending login request...');
    console.log('📋 Login Data:', { ...loginData, password: '***' });

    const response = await axios.post(`${baseURL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Login successful!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', {
      success: response.data.success,
      user: response.data.user,
      token: response.data.token ? 'Present (JWT Token)' : 'Missing'
    });

    // Test protected endpoint with the token
    if (response.data.token) {
      console.log('\n🔒 Testing protected SuperAdmin endpoint...');
      
      try {
        const protectedResponse = await axios.get(`${baseURL}/superadmin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${response.data.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log('✅ Protected endpoint access successful!');
        console.log('📊 Dashboard Status:', protectedResponse.status);
        console.log('📋 Dashboard Data Keys:', Object.keys(protectedResponse.data || {}));
      } catch (protectedError) {
        console.log('❌ Protected endpoint failed:', protectedError.response?.status, protectedError.response?.statusText);
        console.log('📋 Error Details:', protectedError.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Login test failed!');
    
    if (error.response) {
      console.log('📊 Error Status:', error.response.status);
      console.log('📋 Error Data:', error.response.data);
      console.log('📋 Error Headers:', error.response.headers);
    } else if (error.request) {
      console.log('📡 Network Error: No response received');
      console.log('🔍 Check if backend server is running on', baseURL);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Check if backend is running first
async function checkBackendStatus() {
  try {
    console.log('🔍 Checking backend server status...');
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running or not accessible');
    console.log('💡 Please start the backend server with: npm run start:dev');
    return false;
  }
}

async function main() {
  console.log('🚀 SuperAdmin Login Test');
  console.log('========================\n');
  
  const isBackendRunning = await checkBackendStatus();
  
  if (isBackendRunning) {
    await testSuperAdminLogin();
  }
}

main();
