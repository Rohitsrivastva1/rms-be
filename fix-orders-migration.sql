-- Fix orders table migration
-- First, add the restaurant_id column as nullable
ALTER TABLE "orders" ADD COLUMN "restaurant_id" integer;

-- Update existing orders to have a default restaurant_id (assuming restaurant with id 1 exists)
-- If no restaurants exist, we'll need to create one first
UPDATE "orders" SET "restaurant_id" = 1 WHERE "restaurant_id" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "orders" ALTER COLUMN "restaurant_id" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "orders" ADD CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6" 
FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;
