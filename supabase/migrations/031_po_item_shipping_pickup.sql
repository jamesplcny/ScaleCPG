-- ============================================================
-- 031: Add shipping_method and target_pickup_date to purchase_order_items
-- ============================================================

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS target_pickup_date text;
