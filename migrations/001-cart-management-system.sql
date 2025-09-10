-- Cart Management System Migration
-- This migration creates all necessary tables for the cart management system

-- Create new user roles for cart system
ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'cart_owner';
ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'cart_worker';

-- Create Cart Status enum
CREATE TYPE cart_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Create Cart Worker Status enum
CREATE TYPE cart_worker_status AS ENUM ('active', 'inactive', 'on_break');

-- Create Menu Category enum
CREATE TYPE menu_category AS ENUM ('drinks', 'snacks', 'meals', 'desserts', 'beverages');

-- Create Order Status enum (updated)
CREATE TYPE order_status AS ENUM (
  'pending', 
  'accepted', 
  'cooking', 
  'cooking_done', 
  'ready_for_pickup', 
  'delivered', 
  'completed', 
  'cancelled'
);

-- Create Payment Status enum
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create Payment Method enum
CREATE TYPE payment_method AS ENUM ('upi', 'razorpay', 'stripe', 'cash', 'card', 'wallet');

-- Create Notification Type enum
CREATE TYPE notification_type AS ENUM (
  'order_received', 
  'order_accepted', 
  'order_cooking', 
  'order_ready', 
  'order_delivered', 
  'order_cancelled',
  'payment_received',
  'cart_approved',
  'cart_suspended'
);

-- Create Notification Status enum
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'delivered');

-- Create Cart Themes enum
CREATE TYPE cart_theme AS ENUM ('modern', 'classic', 'minimal', 'colorful', 'dark');

-- Create Cart table
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  qr_data TEXT NOT NULL,
  theme cart_theme DEFAULT 'modern',
  status cart_status DEFAULT 'pending',
  subscription_active BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMP,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cart Workers table
CREATE TABLE cart_workers (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'worker', -- worker, cashier, manager
  status cart_worker_status DEFAULT 'active',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, user_id)
);

-- Create Menu Categories table
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Menu Items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES menu_categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category menu_category,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 0, -- in minutes
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cart Payment Settings table
CREATE TABLE cart_payment_settings (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB, -- Store payment gateway specific settings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, payment_method)
);

-- Create Orders table (updated)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  car_number VARCHAR(20), -- For events/functions
  seat_number VARCHAR(20), -- For events/functions
  table_number VARCHAR(20), -- For table service
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  estimated_preparation_time INTEGER DEFAULT 0, -- in minutes
  assigned_worker_id INTEGER REFERENCES cart_workers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  item_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments table (updated)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  payment_intent_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data for the notification
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cart Analytics table
CREATE TABLE cart_analytics (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  peak_hour INTEGER, -- Hour of the day (0-23)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, date)
);

-- Create Customer Feedback table
CREATE TABLE customer_feedback (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cart Settings table
CREATE TABLE cart_settings (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, setting_key)
);

-- Create indexes for better performance
CREATE INDEX idx_carts_owner_id ON carts(owner_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_carts_qr_code ON carts(qr_code);
CREATE INDEX idx_cart_workers_cart_id ON cart_workers(cart_id);
CREATE INDEX idx_cart_workers_user_id ON cart_workers(user_id);
CREATE INDEX idx_menu_categories_cart_id ON menu_categories(cart_id);
CREATE INDEX idx_menu_items_cart_id ON menu_items(cart_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_orders_cart_id ON orders(cart_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_cart_id ON payments(cart_id);
CREATE INDEX idx_notifications_cart_id ON notifications(cart_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_cart_analytics_cart_id ON cart_analytics(cart_id);
CREATE INDEX idx_cart_analytics_date ON cart_analytics(date);
CREATE INDEX idx_customer_feedback_cart_id ON customer_feedback(cart_id);
CREATE INDEX idx_customer_feedback_order_id ON customer_feedback(order_id);

-- Insert default cart settings
INSERT INTO cart_settings (cart_id, setting_key, setting_value) VALUES 
(1, 'offline_mode_enabled', 'true'),
(1, 'multi_language_support', 'false'),
(1, 'table_service_mode', 'false'),
(1, 'discount_coupons_enabled', 'false'),
(1, 'customer_rating_enabled', 'true'),
(1, 'whatsapp_notifications', 'true'),
(1, 'sms_notifications', 'false'),
(1, 'email_notifications', 'true');

-- Create function to generate QR code data
CREATE OR REPLACE FUNCTION generate_qr_data(cart_id INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://yourdomain.com/cart/' || cart_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get current counter value
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 0) + 1 
  INTO counter 
  FROM orders 
  WHERE order_number LIKE 'O%';
  
  -- Format as O000001, O000002, etc.
  new_number := 'O' || LPAD(counter::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate QR data
CREATE OR REPLACE FUNCTION trigger_generate_qr_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_data IS NULL OR NEW.qr_data = '' THEN
    NEW.qr_data := generate_qr_data(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_carts_qr_data
  BEFORE INSERT ON carts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_qr_data();

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION trigger_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_order_number();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER trigger_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_cart_workers_updated_at
  BEFORE UPDATE ON cart_workers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_cart_payment_settings_updated_at
  BEFORE UPDATE ON cart_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_cart_analytics_updated_at
  BEFORE UPDATE ON cart_analytics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_cart_settings_updated_at
  BEFORE UPDATE ON cart_settings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_updated_at();
