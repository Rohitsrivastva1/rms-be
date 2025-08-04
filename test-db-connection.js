const { Client } = require('pg');

async function testDatabaseConnection() {
  // Try different password combinations
  const configs = [
    { password: '9695' }, // From app.module.ts
    { password: 'your_password' },
    { password: '' },
    { password: 'password' },
    { password: 'postgres' }
  ];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`\n🔄 Trying database connection ${i + 1}/5 with password: "${config.password}"`);
    
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'rms_db',
      user: 'postgres',
      password: config.password
    });

    try {
      await client.connect();
      console.log('✅ Connected to database successfully!');
      
      // Test basic query
      const result = await client.query('SELECT COUNT(*) as count FROM orders');
      console.log('📊 Orders in database:', result.rows[0].count);
      
      // Get recent orders
      const ordersResult = await client.query('SELECT id, order_number, status FROM orders ORDER BY id DESC LIMIT 5');
      console.log('📋 Recent orders:');
      console.table(ordersResult.rows);
      
      await client.end();
      return; // Success, exit
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      await client.end();
    }
  }
  
  console.log('\n❌ All database connection attempts failed');
  console.log('💡 Please check:');
  console.log('   - PostgreSQL is running');
  console.log('   - Database "rms_db" exists');
  console.log('   - User "postgres" has correct password');
  console.log('   - Database credentials in .env file');
}

testDatabaseConnection(); 