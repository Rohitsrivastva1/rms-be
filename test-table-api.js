const axios = require('axios');

async function testTableAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('Testing Table API...');
    
    // Test get tables by restaurant
    console.log('\n1. Testing get tables by restaurant...');
    const tablesResponse = await axios.get(`${baseURL}/tables?restaurantId=1`);
    console.log('Tables response:', tablesResponse.data);
    
    // Test create a new table
    console.log('\n2. Testing create table...');
    const newTable = {
      name: 'Test Table',
      number: 'T7',
      capacity: 4,
      area: 'Main Hall',
      status: 'active',
      restaurantId: 1
    };
    
    console.log('Sending data:', newTable);
    const createResponse = await axios.post(`${baseURL}/tables`, newTable);
    console.log('Create response:', createResponse.data);
    
    // Test generate QR code for the new table
    console.log('\n3. Testing generate QR code...');
    const qrResponse = await axios.get(`${baseURL}/tables/${createResponse.data.id}/qr-code`);
    console.log('QR response:', qrResponse.data);
    
    // Test get QR code by table number
    console.log('\n4. Testing get QR code by table number...');
    const qrByNumberResponse = await axios.get(`${baseURL}/tables/qr/T7`);
    console.log('QR by number response:', qrByNumberResponse.data);
    
    // Test update table status
    console.log('\n5. Testing update table status...');
    const updateResponse = await axios.patch(`${baseURL}/tables/${createResponse.data.id}/status`, {
      status: 'inactive'
    });
    console.log('Update response:', updateResponse.data);
    
    console.log('\n✅ All Table API tests passed!');
    
  } catch (error) {
    console.error('❌ Table API test failed:', error.response?.data || error.message);
  }
}

testTableAPI(); 