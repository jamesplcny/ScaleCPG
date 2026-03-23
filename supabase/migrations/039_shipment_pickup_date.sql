-- ============================================================
-- 039: Add pickup_date to shipment_requests (for Truck shipments)
-- ============================================================

ALTER TABLE public.shipment_requests
  ADD COLUMN IF NOT EXISTS pickup_date date;
