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

    // Check if final_amount column exists and is nullable
    const checkFinalAmount = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'final_amount'
    `);

    if (checkFinalAmount.rows.length > 0) {
      console.log('final_amount column exists, checking if nullable...');
      if (checkFinalAmount.rows[0].is_nullable === 'NO') {
        console.log('Making final_amount nullable...');
        await client.query('ALTER TABLE "orders" ALTER COLUMN "final_amount" DROP NOT NULL');
      }
    } else {
      console.log('Adding final_amount column as nullable...');
      await client.query('ALTER TABLE "orders" ADD COLUMN "final_amount" numeric(10,2)');
    }

    // Check if cart_id column exists in menu_items
    const checkCartIdInMenuItems = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'menu_items' AND column_name = 'cart_id'
    `);

    if (checkCartIdInMenuItems.rows.length > 0) {
      console.log('cart_id column exists in menu_items, checking if nullable...');
      if (checkCartIdInMenuItems.rows[0].is_nullable === 'NO') {
        console.log('Making cart_id nullable in menu_items...');
        await client.query('ALTER TABLE "menu_items" ALTER COLUMN "cart_id" DROP NOT NULL');
      }
    } else {
      console.log('Adding cart_id column to menu_items as nullable...');
      await client.query('ALTER TABLE "menu_items" ADD COLUMN "cart_id" integer');
    }

    // Update existing menu_items to have a default cart_id if they don't have one
    console.log('Updating existing menu_items with default cart_id...');
    await client.query(`
      UPDATE "menu_items"
      SET "cart_id" = (SELECT id FROM carts LIMIT 1)
      WHERE "cart_id" IS NULL
    `);

    // Update existing orders to have final_amount if they don't have one
    console.log('Updating existing orders with final_amount...');
    await client.query(`
      UPDATE "orders"
      SET "final_amount" = "total_amount"
      WHERE "final_amount" IS NULL
    `);

    // Now make the columns NOT NULL if needed
    console.log('Making final_amount NOT NULL...');
    await client.query('ALTER TABLE "orders" ALTER COLUMN "final_amount" SET NOT NULL');

    console.log('Making cart_id NOT NULL in menu_items...');
    await client.query('ALTER TABLE "menu_items" ALTER COLUMN "cart_id" SET NOT NULL');

    // Add foreign key constraints if they don't exist
    console.log('Adding foreign key constraints...');
    
    // Check if foreign key exists for menu_items.cart_id
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

    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
  }
}

fixDatabase();
