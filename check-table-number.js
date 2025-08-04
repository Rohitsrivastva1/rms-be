const { Client } = require('pg');

async function checkTableNumber() {
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

    // Check table_number column type
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'tables' AND column_name = 'table_number'
    `);
    
    console.log('Table number column info:', result.rows[0]);

    // Check current table_number values
    const values = await client.query('SELECT table_number FROM tables LIMIT 5');
    console.log('Current table_number values:', values.rows.map(row => row.table_number));

    // If table_number is integer, convert it to varchar
    if (result.rows[0] && result.rows[0].data_type === 'integer') {
      console.log('Converting table_number from integer to varchar...');
      
      // First, update the values to string format with proper casting
      await client.query(`
        UPDATE tables 
        SET table_number = 'T' || CAST(table_number AS TEXT)
        WHERE table_number < 100
      `);
      
      // Then alter the column type
      await client.query(`
        ALTER TABLE tables 
        ALTER COLUMN table_number TYPE VARCHAR(50)
      `);
      
      console.log('✅ Table number converted to varchar!');
    }

    // Verify the changes
    const finalCheck = await client.query('SELECT table_number FROM tables ORDER BY id LIMIT 5');
    console.log('Final table_number values:', finalCheck.rows.map(row => row.table_number));

  } catch (error) {
    console.error('❌ Table number check failed:', error);
  } finally {
    await client.end();
  }
}

checkTableNumber(); 