-- Venue orders. Restaurant orders and order_items stay untouched.

DO $$
BEGIN
  CREATE TYPE cart_order_status AS ENUM (
    'pending',
    'accepted',
    'cooking',
    'cooking_done',
    'ready_for_pickup',
    'delivered',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cart_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  car_number VARCHAR(20),
  seat_number VARCHAR(20),
  table_number VARCHAR(20),
  status cart_order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_amount NUMERIC(10, 2) NOT NULL,
  special_instructions TEXT,
  estimated_preparation_time INTEGER NOT NULL DEFAULT 0,
  assigned_worker_id INTEGER REFERENCES cart_workers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES cart_orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES cart_menu_items(id) ON DELETE SET NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
