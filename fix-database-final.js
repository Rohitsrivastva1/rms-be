const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'rms_db',
  user: 'postgres',
  password: '9695'
});

async function fixDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // First, let's check what tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

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

    // Check if there are any carts, create default if none
    const cartCheck = await client.query('SELECT id FROM carts LIMIT 1');
    if (cartCheck.rows.length === 0) {
      console.log('No carts found. Creating a default cart...');
      await client.query(`
        INSERT INTO carts (name, description, location, qr_code, qr_data, theme, status, subscription_active, owner_id, created_at, updated_at)
        VALUES ('Default Cart', 'Default Cart Description', 'Default Location', 'DEFAULT_QR_001', '{"cartId": 1}', 'modern', 'active', true, 1, NOW(), NOW())
      `);
    }

    // Fix orders table - add missing columns
    console.log('Fixing orders table...');
    
    // Add final_amount column if it doesn't exist
    const checkFinalAmount = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'final_amount'
    `);

    if (checkFinalAmount.rows.length === 0) {
      console.log('Adding final_amount column...');
      await client.query('ALTER TABLE "orders" ADD COLUMN "final_amount" numeric(10,2)');
    }

    // Update existing orders to have final_amount
    await client.query(`
      UPDATE "orders"
      SET "final_amount" = "total_amount"
      WHERE "final_amount" IS NULL
    `);

    // Make final_amount NOT NULL
    await client.query('ALTER TABLE "orders" ALTER COLUMN "final_amount" SET NOT NULL');

    // Add other missing columns to orders
    const orderColumns = [
      'customer_email VARCHAR(100)',
      'car_number VARCHAR(20)',
      'seat_number VARCHAR(20)',
      'tax_amount numeric(10,2) DEFAULT 0',
      'discount_amount numeric(10,2) DEFAULT 0'
    ];

    for (const column of orderColumns) {
      const [colName] = column.split(' ');
      const checkCol = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = '${colName}'
      `);
      
      if (checkCol.rows.length === 0) {
        console.log(`Adding ${colName} column to orders...`);
        await client.query(`ALTER TABLE "orders" ADD COLUMN "${colName}" ${column.split(' ').slice(1).join(' ')}`);
      }
    }

    // Fix menu_items table
    console.log('Fixing menu_items table...');
    
    // Check if cart_id column exists in menu_items
    const checkCartIdInMenuItems = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'menu_items' AND column_name = 'cart_id'
    `);

    if (checkCartIdInMenuItems.rows.length === 0) {
      console.log('Adding cart_id column to menu_items...');
      await client.query('ALTER TABLE "menu_items" ADD COLUMN "cart_id" integer');
    }

    // Update existing menu_items to have a default cart_id
    await client.query(`
      UPDATE "menu_items"
      SET "cart_id" = (SELECT id FROM carts LIMIT 1)
      WHERE "cart_id" IS NULL
    `);

    // Make cart_id NOT NULL
    await client.query('ALTER TABLE "menu_items" ALTER COLUMN "cart_id" SET NOT NULL');

    // Add foreign key constraint for menu_items.cart_id
    const checkFKMenuItems = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'menu_items' AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%cart_id%'
    `);

    if (checkFKMenuItems.rows.length === 0) {
      console.log('Adding foreign key constraint for menu_items.cart_id...');
      await client.query(`
        ALTER TABLE "menu_items"
        ADD CONSTRAINT "FK_menu_items_cart_id"
        FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE
      `);
    }

    // Create cart-related tables if they don't exist
    console.log('Creating cart-related tables...');
    
    // Cart Workers table
    const cartWorkersCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_workers'
    `);
    
    if (cartWorkersCheck.rows.length === 0) {
      console.log('Creating cart_workers table...');
      await client.query(`
        CREATE TABLE cart_workers (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          user_id integer NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'worker',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Menu Categories table
    const menuCategoriesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'menu_categories'
    `);
    
    if (menuCategoriesCheck.rows.length === 0) {
      console.log('Creating menu_categories table...');
      await client.query(`
        CREATE TABLE menu_categories (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          sort_order integer NOT NULL DEFAULT 0,
          is_active boolean NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Cart Payment Settings table
    const cartPaymentSettingsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_payment_settings'
    `);
    
    if (cartPaymentSettingsCheck.rows.length === 0) {
      console.log('Creating cart_payment_settings table...');
      await client.query(`
        CREATE TABLE cart_payment_settings (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          payment_method VARCHAR(20) NOT NULL,
          is_enabled boolean NOT NULL DEFAULT true,
          settings JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Cart Analytics table
    const cartAnalyticsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_analytics'
    `);
    
    if (cartAnalyticsCheck.rows.length === 0) {
      console.log('Creating cart_analytics table...');
      await client.query(`
        CREATE TABLE cart_analytics (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          date DATE NOT NULL,
          total_orders integer NOT NULL DEFAULT 0,
          total_revenue numeric(10,2) NOT NULL DEFAULT 0,
          total_customers integer NOT NULL DEFAULT 0,
          average_order_value numeric(10,2) NOT NULL DEFAULT 0,
          peak_hour integer,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Customer Feedback table
    const customerFeedbackCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'customer_feedback'
    `);
    
    if (customerFeedbackCheck.rows.length === 0) {
      console.log('Creating customer_feedback table...');
      await client.query(`
        CREATE TABLE customer_feedback (
          id SERIAL PRIMARY KEY,
          order_id integer NOT NULL,
          cart_id integer NOT NULL,
          customer_name VARCHAR(100),
          customer_phone VARCHAR(20),
          rating integer,
          review TEXT,
          is_anonymous boolean NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Cart Settings table
    const cartSettingsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_settings'
    `);
    
    if (cartSettingsCheck.rows.length === 0) {
      console.log('Creating cart_settings table...');
      await client.query(`
        CREATE TABLE cart_settings (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          setting_key VARCHAR(100) NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Cart Orders table
    const cartOrdersCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_orders'
    `);
    
    if (cartOrdersCheck.rows.length === 0) {
      console.log('Creating cart_orders table...');
      await client.query(`
        CREATE TABLE cart_orders (
          id SERIAL PRIMARY KEY,
          cart_id integer NOT NULL,
          order_number VARCHAR(20) UNIQUE NOT NULL,
          customer_name VARCHAR(100),
          customer_phone VARCHAR(20),
          customer_email VARCHAR(100),
          car_number VARCHAR(20),
          seat_number VARCHAR(20),
          total_amount numeric(10,2) NOT NULL,
          tax_amount numeric(10,2) DEFAULT 0,
          discount_amount numeric(10,2) DEFAULT 0,
          final_amount numeric(10,2) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(20),
          payment_status VARCHAR(20) DEFAULT 'pending',
          assigned_worker_id integer,
          estimated_time integer DEFAULT 0,
          special_instructions TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    // Cart Order Items table
    const cartOrderItemsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'cart_order_items'
    `);
    
    if (cartOrderItemsCheck.rows.length === 0) {
      console.log('Creating cart_order_items table...');
      await client.query(`
        CREATE TABLE cart_order_items (
          id SERIAL PRIMARY KEY,
          order_id integer NOT NULL,
          menu_item_id integer NOT NULL,
          quantity integer NOT NULL DEFAULT 1,
          unit_price numeric(10,2) NOT NULL,
          total_price numeric(10,2) NOT NULL,
          special_instructions TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'received',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }

    console.log('Database fix completed successfully!');
    console.log('All cart management tables are now ready.');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
  }
}

fixDatabase();
