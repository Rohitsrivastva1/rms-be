const { Client } = require('pg');

async function fixTableNumber() {
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

    // Add a temporary column
    console.log('Adding temporary column...');
    await client.query(`
      ALTER TABLE tables ADD COLUMN table_number_new VARCHAR(50)
    `);

    // Update the temporary column with string values
    console.log('Updating temporary column...');
    await client.query(`
      UPDATE tables 
      SET table_number_new = 'T' || table_number::text
    `);

    // Drop the old column and rename the new one
    console.log('Replacing old column...');
    await client.query(`
      ALTER TABLE tables DROP COLUMN table_number
    `);

    await client.query(`
      ALTER TABLE tables RENAME COLUMN table_number_new TO table_number
    `);

    console.log('✅ Table number converted to varchar!');

    // Verify the changes
    const finalCheck = await client.query('SELECT id, table_number, name, area FROM tables ORDER BY id');
    console.log('\nFinal table data:');
    finalCheck.rows.forEach(row => {
      console.log(`ID: ${row.id}, Number: ${row.table_number}, Name: ${row.name}, Area: ${row.area}`);
    });

  } catch (error) {
    console.error('❌ Table number fix failed:', error);
  } finally {
    await client.end();
  }
}

fixTableNumber(); 