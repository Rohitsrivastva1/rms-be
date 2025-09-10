const { Client } = require('pg');

async function fixUserRolesEnum() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: '9695'
  });

  try {
    console.log('🔧 Fixing User Roles Enum...\n');
    
    await client.connect();
    console.log('✅ Database connected successfully');

    // Check current enum values
    console.log('\n1. Checking current enum values...');
    const currentRoles = await client.query(`
      SELECT unnest(enum_range(NULL::users_role_enum)) as role_value
    `);
    console.log('Current roles:', currentRoles.rows.map(r => r.role_value));

    // Add missing roles to the enum
    console.log('\n2. Adding missing roles to enum...');
    
    try {
      await client.query(`ALTER TYPE users_role_enum ADD VALUE 'cart_owner'`);
      console.log('✅ Added cart_owner role');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ cart_owner role already exists');
      } else {
        console.log('❌ Error adding cart_owner:', error.message);
      }
    }

    try {
      await client.query(`ALTER TYPE users_role_enum ADD VALUE 'cart_worker'`);
      console.log('✅ Added cart_worker role');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ cart_worker role already exists');
      } else {
        console.log('❌ Error adding cart_worker:', error.message);
      }
    }

    // Verify the updated enum
    console.log('\n3. Verifying updated enum...');
    const updatedRoles = await client.query(`
      SELECT unnest(enum_range(NULL::users_role_enum)) as role_value
    `);
    console.log('Updated roles:', updatedRoles.rows.map(r => r.role_value));

    // Test insertion with new roles
    console.log('\n4. Testing user insertion with new roles...');
    try {
      const insertResult = await client.query(`
        INSERT INTO users (name, email, password, phone, role, status, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, name, email, role, status
      `, [
        'Test Cart Owner',
        'testcartdb2@example.com',
        '$2a$10$test.hash.here', // dummy hash
        '+91 98765 43210',
        'cart_owner',
        'active',
        true
      ]);
      console.log('✅ Cart Owner inserted successfully:', insertResult.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM users WHERE email = $1', ['testcartdb2@example.com']);
      console.log('✅ Test user cleaned up');
      
    } catch (insertError) {
      console.log('❌ User insertion failed:', insertError.message);
    }

    console.log('\n✅ User roles enum fixed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixUserRolesEnum();
