const { Client } = require('pg');

async function fixDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: '9695'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if restaurant_id column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'restaurant_id'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding restaurant_id column as nullable...');
      await client.query('ALTER TABLE "orders" ADD COLUMN "restaurant_id" integer');
    }

    // Check if there are any restaurants
    const restaurantCheck = await client.query('SELECT id FROM restaurants LIMIT 1');
    
    if (restaurantCheck.rows.length === 0) {
      console.log('No restaurants found. Creating a default restaurant...');
      await client.query(`
        INSERT INTO restaurants (name, address, phone, email, status, created_at, updated_at)
        VALUES ('Default Restaurant', 'Default Address', '0000000000', 'default@restaurant.com', 'active', NOW(), NOW())
      `);
    }

    // Update existing orders to have a restaurant_id
    console.log('Updating existing orders...');
    await client.query(`
      UPDATE "orders" 
      SET "restaurant_id" = (SELECT id FROM restaurants LIMIT 1) 
      WHERE "restaurant_id" IS NULL
    `);

    // Make the column NOT NULL
    console.log('Making restaurant_id NOT NULL...');
    await client.query('ALTER TABLE "orders" ALTER COLUMN "restaurant_id" SET NOT NULL');

    // Add foreign key constraint if it doesn't exist
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'orders' AND constraint_name = 'FK_85fdda5fcce2f397ef8f117a2c6'
    `);

    if (constraintCheck.rows.length === 0) {
      console.log('Adding foreign key constraint...');
      await client.query(`
        ALTER TABLE "orders" ADD CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6" 
        FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      `);
    }

    // Check if cart_id column exists
    const checkCartIdColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'cart_id'
    `);

    if (checkCartIdColumn.rows.length === 0) {
      console.log('Adding cart_id column as nullable...');
      await client.query('ALTER TABLE "orders" ADD COLUMN "cart_id" integer');
    }

    // Check if carts table exists, if not create it
    const cartTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'carts'
    `);

    if (cartTableCheck.rows.length === 0) {
      console.log('Creating carts table...');
      await client.query(`
        CREATE TABLE carts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          location VARCHAR(255),
          qr_code VARCHAR UNIQUE NOT NULL,
          qr_data TEXT NOT NULL,
          theme VARCHAR(20) DEFAULT 'modern',
          status VARCHAR(20) DEFAULT 'pending',
          subscription_active BOOLEAN DEFAULT false,
          subscription_expires_at TIMESTAMP,
          owner_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
    }

    // Check if there are any carts
    const cartCheck = await client.query('SELECT id FROM carts LIMIT 1');
    
    if (cartCheck.rows.length === 0) {
      console.log('No carts found. Creating a default cart...');
      await client.query(`
        INSERT INTO carts (name, description, location, qr_code, qr_data, theme, status, subscription_active, owner_id, created_at, updated_at)
        VALUES ('Default Cart', 'Default Cart Description', 'Default Location', 'DEFAULT_QR_001', '{"cartId": 1}', 'modern', 'active', true, 1, NOW(), NOW())
      `);
    }

    // Update existing orders to have a cart_id
    console.log('Updating existing orders with cart_id...');
    await client.query(`
      UPDATE "orders" 
      SET "cart_id" = (SELECT id FROM carts LIMIT 1) 
      WHERE "cart_id" IS NULL
    `);

    // Make the cart_id column NOT NULL
    console.log('Making cart_id NOT NULL...');
    await client.query('ALTER TABLE "orders" ALTER COLUMN "cart_id" SET NOT NULL');

    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
  }
}

fixDatabase();
