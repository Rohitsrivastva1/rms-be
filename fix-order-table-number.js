const { Client } = require('pg');

async function fixOrderTableNumber() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: '9695'
  });

  try {
    await client.connect();
    console.log('🔧 Fixing orders table_number column...');

    // Check current column type
    const checkResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'table_number'
    `);

    if (checkResult.rows.length > 0) {
      const currentType = checkResult.rows[0].data_type;
      console.log(`Current table_number type: ${currentType}`);

      if (currentType === 'integer') {
        // Convert integer to varchar
        console.log('Converting table_number from integer to varchar...');
        
        // First, update any existing integer values to string format
        await client.query(`
          UPDATE orders 
          SET table_number = 'T' || table_number::text 
          WHERE table_number IS NOT NULL
        `);

        // Then alter the column type
        await client.query(`
          ALTER TABLE orders 
          ALTER COLUMN table_number TYPE VARCHAR(50)
        `);

        console.log('✅ Successfully converted table_number to VARCHAR(50)');
      } else {
        console.log('✅ table_number is already VARCHAR type');
      }
    } else {
      console.log('❌ table_number column not found');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error fixing table_number:', error);
    await client.end();
  }
}

fixOrderTableNumber(); 