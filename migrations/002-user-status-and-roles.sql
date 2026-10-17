-- Signup and staff queries expect users.status and the full user_role set.
-- The live table only had super_admin, admin, chef, and customer.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiter';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cart_owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cart_worker';

DO $$
BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'on_leave');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';
