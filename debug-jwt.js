const jwt = require('jsonwebtoken');

// Decode the JWT token from the test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJlbWFpbCI6ImpvaG4uY2FydEBleGFtcGxlLmNvbSIsInJvbGUiOiJjYXJ0X293bmVyIiwicmVzdGF1cmFudElkIjpudWxsLCJpYXQiOjE3NTc0NTA4NDMsImV4cCI6MTc1NzUzNzI0M30.7z7bIXoXCqQUuLXRaQ5eQg7CVnHLabKi-1-4v4yzxrA';

try {
  const decoded = jwt.decode(token);
  console.log('Decoded JWT payload:');
  console.log(JSON.stringify(decoded, null, 2));
  
  console.log('\nUser ID (sub):', decoded.sub);
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role);
} catch (error) {
  console.error('Error decoding JWT:', error.message);
}
