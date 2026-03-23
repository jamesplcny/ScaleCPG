-- ============================================================
-- 029: Add shipment_method to product_catalog_requests for order requests
-- ============================================================

ALTER TABLE public.product_catalog_requests
  ADD COLUMN IF NOT EXISTS shipment_method TEXT;
