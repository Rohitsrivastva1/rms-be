const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'rms_db',
  user: 'postgres',
  password: '9695'
});

async function checkMenuItemsTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if menu_items table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'menu_items'
      );
    `);
    console.log('menu_items table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table structure
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'menu_items'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nTable structure:');
      structure.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });

      // Check if there are any records
      const count = await client.query('SELECT COUNT(*) FROM menu_items');
      console.log('\nTotal records:', count.rows[0].count);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMenuItemsTable();
