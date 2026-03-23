-- ============================================================
-- 032: Move ready_by_date to purchase_orders, add note
-- ============================================================

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS ready_by_date text,
  ADD COLUMN IF NOT EXISTS note text;
