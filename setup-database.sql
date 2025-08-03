-- Restaurant Management System Database Setup
-- Run this script in PostgreSQL to create all necessary tables

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'chef', 'customer');
CREATE TYPE restaurant_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE menu_category AS ENUM ('appetizer', 'main_course', 'dessert', 'beverage', 'side_dish');
CREATE TYPE order_status AS ENUM ('received', 'in_progress', 'ready', 'served', 'cancelled');
CREATE TYPE table_status AS ENUM ('free', 'occupied', 'reserved', 'cleaning');
CREATE TYPE feedback_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'razorpay');
CREATE TYPE notification_type AS ENUM ('order_received', 'order_in_progress', 'order_ready', 'order_served', 'payment_received', 'feedback_received', 'system_alert');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    restaurant_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    cuisine VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    status restaurant_status DEFAULT 'pending',
    logo VARCHAR(255),
    description TEXT,
    rating DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category menu_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT true,
    veg BOOLEAN DEFAULT false,
    spicy_level INTEGER DEFAULT 0,
    ingredients TEXT[],
    image VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    popular BOOLEAN DEFAULT false,
    restaurant_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    table_number INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    status order_status DEFAULT 'received',
    total_amount DECIMAL(10,2) NOT NULL,
    estimated_time INTEGER DEFAULT 0,
    assigned_chef_id INTEGER,
    special_instructions TEXT,
    payment_details JSONB,
    rating DECIMAL(3,2),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status order_status DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables table
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    status table_status DEFAULT 'free',
    restaurant_id INTEGER NOT NULL,
    location VARCHAR(100),
    qr_code VARCHAR(255),
    current_order_id INTEGER,
    current_order_total DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    status feedback_status DEFAULT 'pending',
    dish_ratings JSONB,
    restaurant_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_intent_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    transaction_data JSONB,
    restaurant_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    user_id INTEGER,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    device_token TEXT,
    status notification_status DEFAULT 'pending',
    metadata JSONB,
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE menu_items ADD CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_chef FOREIGN KEY (assigned_chef_id) REFERENCES users(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id);
ALTER TABLE tables ADD CONSTRAINT fk_tables_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE tables ADD CONSTRAINT fk_tables_current_order FOREIGN KEY (current_order_id) REFERENCES orders(id);
ALTER TABLE feedback ADD CONSTRAINT fk_feedback_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE feedback ADD CONSTRAINT fk_feedback_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX idx_restaurants_email ON restaurants(email);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_feedback_restaurant_id ON feedback(restaurant_id);
CREATE INDEX idx_feedback_order_id ON feedback(order_id);
CREATE INDEX idx_payments_restaurant_id ON payments(restaurant_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_restaurant_id ON notifications(restaurant_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Insert a default super admin user
INSERT INTO users (name, email, password, role) 
VALUES ('Super Admin', 'admin@rms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Insert a test restaurant
INSERT INTO restaurants (name, email, phone, address, cuisine, capacity, status) 
VALUES ('Test Restaurant', 'test@restaurant.com', '+919695700251', '123 Test Street, Mumbai', 'Indian', 50, 'active');

-- Insert test menu items
INSERT INTO menu_items (name, description, category, price, veg, restaurant_id) 
VALUES 
('Butter Chicken', 'Creamy and rich butter chicken', 'main_course', 450.00, false, 1),
('Paneer Tikka', 'Grilled cottage cheese with spices', 'appetizer', 250.00, true, 1),
('Gulab Jamun', 'Sweet dessert balls', 'dessert', 100.00, true, 1);

COMMIT; 