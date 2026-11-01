-- One guest at a time per table. The QR carries seat_key, not the table number.

ALTER TABLE cart_tables ADD COLUMN IF NOT EXISTS seat_key TEXT;

UPDATE cart_tables
SET seat_key = gen_random_uuid()::text || gen_random_uuid()::text
WHERE seat_key IS NULL;

ALTER TABLE cart_tables ALTER COLUMN seat_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cart_tables_seat_key_key ON cart_tables (seat_key);

CREATE TABLE IF NOT EXISTS cart_seat_sessions (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES cart_tables(id) ON DELETE CASCADE,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_seat_one_active
  ON cart_seat_sessions (table_id)
  WHERE status = 'active';

ALTER TABLE cart_orders ADD COLUMN IF NOT EXISTS seat_session_id INTEGER REFERENCES cart_seat_sessions(id);
