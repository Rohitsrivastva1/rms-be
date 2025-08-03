-- Reset RMS Database
-- Run this script to clean up the database

-- Drop all tables if they exist
DROP TABLE IF EXISTS "feedback" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "tables" CASCADE;
DROP TABLE IF EXISTS "menu_items" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "restaurants" CASCADE;

-- Drop all enums if they exist
DROP TYPE IF EXISTS "user_role" CASCADE;
DROP TYPE IF EXISTS "restaurant_status" CASCADE;
DROP TYPE IF EXISTS "order_status" CASCADE;
DROP TYPE IF EXISTS "payment_method" CASCADE;
DROP TYPE IF EXISTS "payment_status" CASCADE;
DROP TYPE IF EXISTS "notification_type" CASCADE;
DROP TYPE IF EXISTS "notification_status" CASCADE;
DROP TYPE IF EXISTS "table_status" CASCADE;
DROP TYPE IF EXISTS "feedback_status" CASCADE;

-- Create enums
CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin', 'manager', 'chef', 'waiter', 'customer');
CREATE TYPE "restaurant_status" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "order_status" AS ENUM ('pending', 'received', 'in_progress', 'ready', 'completed', 'cancelled');
CREATE TYPE "payment_method" AS ENUM ('cash', 'card', 'upi', 'wallet');
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE "notification_type" AS ENUM ('order', 'payment', 'system', 'feedback');
CREATE TYPE "notification_status" AS ENUM ('unread', 'read');
CREATE TYPE "table_status" AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE "feedback_status" AS ENUM ('pending', 'reviewed', 'resolved');

-- Create tables with proper structure
CREATE TABLE "restaurants" (
    "id" SERIAL PRIMARY KEY,
    "name" character varying NOT NULL,
    "email" character varying NOT NULL UNIQUE,
    "phone" character varying,
    "address" text,
    "cuisine" character varying,
    "capacity" integer DEFAULT 50,
    "status" "restaurant_status" DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" character varying NOT NULL,
    "email" character varying NOT NULL UNIQUE,
    "password" character varying NOT NULL,
    "phone" character varying,
    "role" "user_role" NOT NULL,
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "is_active" boolean DEFAULT true,
    "last_login_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "menu_items" (
    "id" SERIAL PRIMARY KEY,
    "name" character varying NOT NULL,
    "description" text,
    "price" decimal(10,2) NOT NULL,
    "category" character varying,
    "ingredients" text[],
    "image_url" character varying,
    "is_available" boolean DEFAULT true,
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "tables" (
    "id" SERIAL PRIMARY KEY,
    "table_number" integer NOT NULL,
    "capacity" integer DEFAULT 4,
    "status" "table_status" DEFAULT 'available',
    "qr_code" character varying,
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "current_order_id" integer,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "order_id" character varying(20) UNIQUE,
    "table_number" integer,
    "total_amount" decimal(10,2) NOT NULL,
    "status" "order_status" DEFAULT 'pending',
    "assigned_chef" integer REFERENCES "users"("id"),
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "order_items" (
    "id" SERIAL PRIMARY KEY,
    "quantity" integer NOT NULL,
    "unit_price" decimal(10,2) NOT NULL,
    "total_price" decimal(10,2) NOT NULL,
    "special_instructions" text,
    "order_id" integer REFERENCES "orders"("id"),
    "menu_item_id" integer REFERENCES "menu_items"("id"),
    "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "payments" (
    "id" SERIAL PRIMARY KEY,
    "amount" decimal(10,2) NOT NULL,
    "payment_method" "payment_method",
    "status" "payment_status" DEFAULT 'pending',
    "transaction_id" character varying,
    "order_id" integer REFERENCES "orders"("id"),
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "notifications" (
    "id" SERIAL PRIMARY KEY,
    "title" character varying NOT NULL,
    "message" text NOT NULL,
    "type" "notification_type",
    "status" "notification_status" DEFAULT 'unread',
    "user_id" integer REFERENCES "users"("id"),
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "feedback" (
    "id" SERIAL PRIMARY KEY,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    "status" "feedback_status" DEFAULT 'pending',
    "order_id" integer REFERENCES "orders"("id"),
    "restaurant_id" integer REFERENCES "restaurants"("id"),
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_restaurant_id" ON "users"("restaurant_id");
CREATE INDEX "idx_restaurants_email" ON "restaurants"("email");
CREATE INDEX "idx_restaurants_status" ON "restaurants"("status");
CREATE INDEX "idx_menu_items_restaurant_id" ON "menu_items"("restaurant_id");
CREATE INDEX "idx_menu_items_category" ON "menu_items"("category");
CREATE INDEX "idx_orders_restaurant_id" ON "orders"("restaurant_id");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_table_number" ON "orders"("table_number");
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX "idx_payments_restaurant_id" ON "payments"("restaurant_id");
CREATE INDEX "idx_payments_order_id" ON "payments"("order_id");
CREATE INDEX "idx_payments_status" ON "payments"("status");
CREATE INDEX "idx_notifications_restaurant_id" ON "notifications"("restaurant_id");
CREATE INDEX "idx_notifications_type" ON "notifications"("type");
CREATE INDEX "idx_notifications_status" ON "notifications"("status");
CREATE INDEX "idx_tables_restaurant_id" ON "tables"("restaurant_id");
CREATE INDEX "idx_tables_status" ON "tables"("status");
CREATE INDEX "idx_feedback_restaurant_id" ON "feedback"("restaurant_id");
CREATE INDEX "idx_feedback_order_id" ON "feedback"("order_id");

-- Insert sample data
INSERT INTO "restaurants" ("name", "email", "phone", "address", "cuisine", "capacity") VALUES
('Spice Garden', 'spicegarden@example.com', '+91 98765 43210', '123 Main Street, Mumbai', 'Indian', 100),
('Pizza Palace', 'pizzapalace@example.com', '+91 98765 43211', '456 Oak Avenue, Delhi', 'Italian', 80);

-- Insert sample users
INSERT INTO "users" ("name", "email", "password", "phone", "role", "restaurant_id") VALUES
('Admin User', 'admin@spicegarden.com', '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J', '+91 98765 43210', 'admin', 1),
('Chef John', 'chef@spicegarden.com', '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J', '+91 98765 43211', 'chef', 1),
('Manager Sarah', 'manager@spicegarden.com', '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J', '+91 98765 43212', 'manager', 1);

-- Insert sample menu items
INSERT INTO "menu_items" ("name", "description", "price", "category", "ingredients", "restaurant_id") VALUES
('Butter Chicken', 'Creamy and rich butter chicken curry', 350.00, 'Main Course', ARRAY['chicken', 'butter', 'cream', 'spices'], 1),
('Biryani', 'Fragrant rice dish with tender meat', 450.00, 'Main Course', ARRAY['rice', 'meat', 'spices', 'herbs'], 1),
('Naan', 'Soft and fluffy bread', 50.00, 'Bread', ARRAY['flour', 'yeast', 'water'], 1);

-- Insert sample tables
INSERT INTO "tables" ("table_number", "capacity", "restaurant_id") VALUES
(1, 4, 1),
(2, 6, 1),
(3, 2, 1),
(4, 8, 1);

COMMIT; 