-- ============================================================
-- 021: Add order_request type + desired_quantity column
-- ============================================================

-- 1) Add desired_quantity column (nullable for backward compat)
ALTER TABLE public.product_catalog_requests
  ADD COLUMN IF NOT EXISTS desired_quantity text;

-- 2) Expand request_type CHECK to include 'order_request'
ALTER TABLE public.product_catalog_requests
  DROP CONSTRAINT IF EXISTS product_catalog_requests_request_type_check;

ALTER TABLE public.product_catalog_requests
  ADD CONSTRAINT product_catalog_requests_request_type_check
    CHECK (request_type IN ('sample_request', 'modification_request', 'order_request'));
