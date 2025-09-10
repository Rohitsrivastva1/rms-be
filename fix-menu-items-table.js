const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'rms_db',
  user: 'postgres',
  password: '9695'
});

async function fixMenuItemsTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop the existing menu_items table and recreate it
    console.log('Dropping existing menu_items table...');
    await client.query('DROP TABLE IF EXISTS menu_items CASCADE;');

    // Create the new menu_items table with correct schema
    console.log('Creating new menu_items table...');
    await client.query(`
      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL,
        category_id INTEGER,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        categoryType VARCHAR(50),
        is_available BOOLEAN DEFAULT true,
        is_vegetarian BOOLEAN DEFAULT false,
        is_spicy BOOLEAN DEFAULT false,
        preparation_time INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
      );
    `);

    console.log('✅ menu_items table created successfully');

    // Create index for better performance
    await client.query('CREATE INDEX idx_menu_items_cart_id ON menu_items(cart_id);');
    await client.query('CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);');

    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixMenuItemsTable();
