-- 040: Remove in_progress from purchase_orders + in_production from status_report_items
--
-- 1) purchase_orders: "in_progress" was never used in the workflow (POs go pending → completed).
--    Any existing in_progress POs are updated to completed.
--
-- 2) status_report_items: "in_production" feature is being removed entirely.
--    Any existing in_production items are reverted to "accepted" since that was their
--    prior state before the now-removed In Production action was applied.

-- Fix purchase_orders
UPDATE purchase_orders SET status = 'completed' WHERE status = 'in_progress';

ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check
  CHECK (status IN ('pending', 'open', 'ready_for_pickup', 'completed'));

-- Fix status_report_items
UPDATE status_report_items SET status = 'accepted' WHERE status = 'in_production';
