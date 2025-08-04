const { Client } = require('pg');

async function fixTablesSchema() {
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

    // Check if name column exists
    const nameCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tables' AND column_name = 'name'
    `);

    if (nameCheck.rows.length === 0) {
      console.log('Adding name column...');
      await client.query(`
        ALTER TABLE tables ADD COLUMN name VARCHAR(100)
      `);
    }

    // Check if area column exists
    const areaCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tables' AND column_name = 'area'
    `);

    if (areaCheck.rows.length === 0) {
      console.log('Adding area column...');
      await client.query(`
        ALTER TABLE tables ADD COLUMN area VARCHAR(100)
      `);
    }

    // Update existing tables with proper names and areas
    console.log('Updating table data...');
    await client.query(`
      UPDATE tables 
      SET 
        name = CASE 
          WHEN table_number = 1 THEN 'Table 1'
          WHEN table_number = 2 THEN 'Table 2'
          WHEN table_number = 3 THEN 'Table 3'
          WHEN table_number = 4 THEN 'Table 4'
          WHEN table_number = 5 THEN 'Table 5'
          WHEN table_number = 6 THEN 'Table 6'
          ELSE 'Table ' || table_number
        END,
        area = CASE 
          WHEN table_number IN (1, 3) THEN 'Main Hall'
          WHEN table_number = 2 THEN 'VIP Section'
          WHEN table_number = 4 THEN 'Outdoor'
          WHEN table_number = 5 THEN 'AC Room'
          WHEN table_number = 6 THEN 'Bar Area'
          ELSE 'Main Hall'
        END
      WHERE name IS NULL OR area IS NULL
    `);

    console.log('✅ Tables schema fixed successfully!');

    // Verify the updates
    const result = await client.query('SELECT id, table_number, name, area FROM tables ORDER BY table_number');
    console.log('\nUpdated tables:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Number: ${row.table_number}, Name: ${row.name}, Area: ${row.area}`);
    });

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  } finally {
    await client.end();
  }
}

fixTablesSchema(); 