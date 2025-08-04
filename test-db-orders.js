const { Client } = require('pg');

async function testDatabaseOrders() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: 'your_password' // Try the default password from env.example
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check orders table
    const result = await client.query('SELECT * FROM orders ORDER BY id DESC LIMIT 5');
    console.log('📋 Orders in database:');
    console.table(result.rows);

    // Check order_items table
    const itemsResult = await client.query('SELECT * FROM order_items ORDER BY id DESC LIMIT 5');
    console.log('\n📦 Order items in database:');
    console.table(itemsResult.rows);

  } catch (error) {
    console.error('❌ Database error:', error);
    
    // Try with empty password
    try {
      console.log('\n🔄 Trying with empty password...');
      const client2 = new Client({
        host: 'localhost',
        port: 5432,
        database: 'rms_db',
        user: 'postgres',
        password: ''
      });
      
      await client2.connect();
      console.log('✅ Connected with empty password');
      
      const result = await client2.query('SELECT * FROM orders ORDER BY id DESC LIMIT 5');
      console.log('📋 Orders in database:');
      console.table(result.rows);
      
      await client2.end();
    } catch (error2) {
      console.error('❌ Still failed:', error2.message);
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

testDatabaseOrders(); 