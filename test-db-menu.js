const { Client } = require('pg');

async function testDatabaseMenu() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '9695',
    database: 'rms_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if menu_items table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'menu_items'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ menu_items table does not exist');
      return;
    }

    console.log('✅ menu_items table exists');

    // Count menu items
    const countResult = await client.query('SELECT COUNT(*) FROM menu_items');
    console.log('📊 Total menu items:', countResult.rows[0].count);

    // Get sample menu items
    const menuItems = await client.query(`
      SELECT id, name, price, category, available, restaurant_id 
      FROM menu_items 
      LIMIT 5
    `);

    console.log('🍽️ Sample menu items:');
    menuItems.rows.forEach(item => {
      console.log(`  - ${item.name} (₹${item.price}) - ${item.category} - Available: ${item.available}`);
    });

    // Check for restaurant_id = 1
    const restaurant1Items = await client.query(`
      SELECT COUNT(*) FROM menu_items WHERE restaurant_id = 1
    `);
    console.log('🏪 Menu items for restaurant_id = 1:', restaurant1Items.rows[0].count);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await client.end();
  }
}

testDatabaseMenu(); 