const { Client } = require('pg');

async function testDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '9695',
    database: 'rms_db'
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tablesResult.rows.map(row => row.table_name));

    // Test if menu_items table has data
    const menuResult = await client.query('SELECT COUNT(*) as count FROM menu_items');
    console.log('Menu items count:', menuResult.rows[0].count);

    // Test if tables table has data
    const tablesCountResult = await client.query('SELECT COUNT(*) as count FROM tables');
    console.log('Tables count:', tablesCountResult.rows[0].count);

    // Test if users table has data
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', usersResult.rows[0].count);

    await client.end();
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 