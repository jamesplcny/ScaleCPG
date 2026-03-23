-- ============================================================
-- 033: Add place_of_delivery, market to purchase_orders; add pending status
-- ============================================================

-- Add new order-level fields
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS place_of_delivery text,
  ADD COLUMN IF NOT EXISTS market text;

-- Widen the status check constraint to include 'pending'
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_status_check
  CHECK (status IN ('pending', 'open', 'ready_for_pickup', 'completed'));

-- New orders default to 'pending'
ALTER TABLE public.purchase_orders ALTER COLUMN status SET DEFAULT 'pending';
