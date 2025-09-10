const { Client } = require('pg');

async function testDatabaseConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: '9695'
  });

  try {
    console.log('🔍 Testing Database Connection...\n');
    
    await client.connect();
    console.log('✅ Database connected successfully');

    // Test 1: Check if users table exists
    console.log('\n1. Checking users table...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('✅ Users table columns:', tableCheck.rows.map(r => `${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));

    // Test 2: Check user roles enum
    console.log('\n2. Checking user roles enum...');
    const enumCheck = await client.query(`
      SELECT unnest(enum_range(NULL::users_role_enum)) as role_value
    `);
    console.log('✅ Available roles:', enumCheck.rows.map(r => r.role_value));

    // Test 3: Check user status enum
    console.log('\n3. Checking user status enum...');
    const statusEnumCheck = await client.query(`
      SELECT unnest(enum_range(NULL::users_status_enum)) as status_value
    `);
    console.log('✅ Available statuses:', statusEnumCheck.rows.map(r => r.status_value));

    // Test 4: Try to insert a test user
    console.log('\n4. Testing user insertion...');
    try {
      const insertResult = await client.query(`
        INSERT INTO users (name, email, password, phone, role, status, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, name, email, role, status
      `, [
        'Test Cart Owner',
        'testcartdb@example.com',
        '$2a$10$test.hash.here', // dummy hash
        '+91 98765 43210',
        'cart_owner',
        'active',
        true
      ]);
      console.log('✅ User inserted successfully:', insertResult.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM users WHERE email = $1', ['testcartdb@example.com']);
      console.log('✅ Test user cleaned up');
      
    } catch (insertError) {
      console.log('❌ User insertion failed:', insertError.message);
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

testDatabaseConnection();