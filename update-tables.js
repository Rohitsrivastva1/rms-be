const { Client } = require('pg');

async function updateTables() {
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

    // Update existing tables with proper names and areas
    await client.query(`
      UPDATE tables 
      SET 
        name = CASE 
          WHEN table_number = 'T1' THEN 'Table 1'
          WHEN table_number = 'T2' THEN 'Table 2'
          WHEN table_number = 'T3' THEN 'Table 3'
          WHEN table_number = 'T4' THEN 'Table 4'
          WHEN table_number = 'T5' THEN 'Table 5'
          WHEN table_number = 'T6' THEN 'Table 6'
          ELSE 'Table ' || table_number
        END,
        area = CASE 
          WHEN table_number IN ('T1', 'T3') THEN 'Main Hall'
          WHEN table_number = 'T2' THEN 'VIP Section'
          WHEN table_number = 'T4' THEN 'Outdoor'
          WHEN table_number = 'T5' THEN 'AC Room'
          WHEN table_number = 'T6' THEN 'Bar Area'
          ELSE 'Main Hall'
        END
      WHERE name IS NULL OR area IS NULL
    `);

    console.log('✅ Tables updated successfully!');

    // Verify the updates
    const result = await client.query('SELECT id, table_number, name, area FROM tables ORDER BY table_number');
    console.log('\nUpdated tables:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Number: ${row.table_number}, Name: ${row.name}, Area: ${row.area}`);
    });

  } catch (error) {
    console.error('❌ Table update failed:', error);
  } finally {
    await client.end();
  }
}

updateTables(); 