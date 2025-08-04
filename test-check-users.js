const { Client } = require('pg');

async function checkUsers() {
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

    // Check all users
    const result = await client.query(`
      SELECT id, name, email, role, status, restaurant_id 
      FROM users 
      ORDER BY id
    `);

    console.log('📊 Users in database:');
    result.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}, Restaurant: ${user.restaurant_id}`);
    });

    // Check specific chef account
    const chefResult = await client.query(`
      SELECT id, name, email, role, status, restaurant_id 
      FROM users 
      WHERE email = 'rohitsrivastv1a.app@gmail.com'
    `);

    if (chefResult.rows.length > 0) {
      console.log('\n👨‍🍳 Chef account found:');
      console.log(chefResult.rows[0]);
    } else {
      console.log('\n❌ Chef account not found');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.end();
  }
}

checkUsers(); 