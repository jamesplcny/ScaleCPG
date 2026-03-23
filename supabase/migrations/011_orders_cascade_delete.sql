-- Migration 011: Change orders.client_id FK from SET NULL to CASCADE
-- When a client is deleted, their orders should be deleted too
-- (consistent with client_products, client_messages, client_orders, ups_shipments)

-- 1. Drop the existing FK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;

-- 2. Clean up orphaned orders BEFORE adding the new constraint
--    Removes orders with NULL client_id (from previous SET NULL deletes)
--    and orders referencing clients that no longer exist
DELETE FROM orders WHERE client_id IS NULL;
DELETE FROM orders WHERE client_id NOT IN (SELECT id FROM clients);

-- 3. Recreate with ON DELETE CASCADE
ALTER TABLE orders
  ADD CONSTRAINT orders_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
