const { Client } = require('pg');

async function seedDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'rms_db',
    user: 'postgres',
    password: '9695' // Use the correct password
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Seed restaurants
    await client.query(`
      INSERT INTO restaurants (id, name, address, phone, email, cuisine_type, rating, is_active, created_at, updated_at)
      VALUES (1, 'Spice Garden', '123 Main St, Delhi', '+91-9876543210', 'info@spicegarden.com', 'Indian', 4.5, true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed menu items
    await client.query(`
      INSERT INTO menu_items (id, name, description, category, price, available, veg, spicy_level, ingredients, image, rating, order_count, popular, restaurant_id, created_at, updated_at)
      VALUES 
        (1, 'Butter Chicken', 'Creamy and rich butter chicken curry', 'main_course', 350.00, true, false, 2, ARRAY['chicken', 'butter', 'cream', 'tomato'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center', 4.5, 120, true, 1, NOW(), NOW()),
        (2, 'Paneer Tikka', 'Grilled cottage cheese with spices', 'appetizer', 250.00, true, true, 1, ARRAY['paneer', 'yogurt', 'spices'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center', 4.2, 85, true, 1, NOW(), NOW()),
        (3, 'Gulab Jamun', 'Sweet dessert balls in sugar syrup', 'dessert', 120.00, true, true, 0, ARRAY['milk powder', 'sugar', 'cardamom'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center', 4.0, 65, false, 1, NOW(), NOW()),
        (4, 'Masala Chai', 'Spiced Indian tea', 'beverage', 50.00, true, true, 0, ARRAY['tea leaves', 'milk', 'spices'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center', 4.3, 200, true, 1, NOW(), NOW()),
        (5, 'Naan Bread', 'Soft leavened bread', 'side_dish', 30.00, true, true, 0, ARRAY['flour', 'yeast', 'salt'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center', 4.1, 150, true, 1, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed tables with correct structure
    await client.query(`
      INSERT INTO tables (id, name, table_number, capacity, area, status, restaurant_id, qr_code, qr_data, notes, created_at, updated_at)
      VALUES 
        (1, 'Table 1', 'T1', 4, 'Main Hall', 'available', 1, 'QR_T1_001', '{"tableId": 1, "tableNumber": "T1", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T1&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Window seat', NOW(), NOW()),
        (2, 'Table 2', 'T2', 6, 'VIP Section', 'available', 1, 'QR_T2_002', '{"tableId": 2, "tableNumber": "T2", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T2&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Private area', NOW(), NOW()),
        (3, 'Table 3', 'T3', 2, 'Main Hall', 'cleaning', 1, 'QR_T3_003', '{"tableId": 3, "tableNumber": "T3", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T3&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Under maintenance', NOW(), NOW()),
        (4, 'Table 4', 'T4', 8, 'Outdoor', 'available', 1, 'QR_T4_004', '{"tableId": 4, "tableNumber": "T4", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T4&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Garden view', NOW(), NOW()),
        (5, 'Table 5', 'T5', 4, 'AC Room', 'available', 1, 'QR_T5_005', '{"tableId": 5, "tableNumber": "T5", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T5&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Air conditioned', NOW(), NOW()),
        (6, 'Table 6', 'T6', 6, 'Bar Area', 'available', 1, 'QR_T6_006', '{"tableId": 6, "tableNumber": "T6", "restaurantId": 1, "url": "http://localhost:3001/menu?table=T6&restaurantId=1", "geofence": {"latitude": 28.6139, "longitude": 77.2090, "radius": 100}}', 'Near bar', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed orders
    await client.query(`
      INSERT INTO orders (id, order_number, table_number, customer_name, customer_phone, total_amount, status, payment_status, restaurant_id, created_at, updated_at)
      VALUES 
        (1, 'ORD-001', 'T1', 'John Doe', '+91-9876543210', 450.00, 'pending', 'pending', 1, NOW(), NOW()),
        (2, 'ORD-002', 'T2', 'Jane Smith', '+91-9876543211', 680.00, 'preparing', 'paid', 1, NOW(), NOW()),
        (3, 'ORD-003', 'T4', 'Mike Johnson', '+91-9876543212', 320.00, 'completed', 'paid', 1, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed order items
    await client.query(`
      INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, special_instructions, created_at)
      VALUES 
        (1, 1, 1, 1, 350.00, 350.00, 'Less spicy', NOW()),
        (2, 1, 4, 2, 50.00, 100.00, 'Extra hot', NOW()),
        (3, 2, 2, 1, 250.00, 250.00, 'No onions', NOW()),
        (4, 2, 3, 2, 120.00, 240.00, 'Extra sweet', NOW()),
        (5, 2, 5, 3, 30.00, 90.00, 'Butter naan', NOW()),
        (6, 3, 1, 1, 350.00, 350.00, 'Medium spicy', NOW()),
        (7, 3, 4, 1, 50.00, 50.00, 'Less sugar', NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await client.end();
  }
}

seedDatabase(); 