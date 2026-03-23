-- ============================================================
-- 027: Quote Requests — schema additions + dummy data cleanup
-- ============================================================

-- 1) Expand request_type CHECK to include 'quote_request'
ALTER TABLE public.product_catalog_requests
  DROP CONSTRAINT IF EXISTS product_catalog_requests_request_type_check;
ALTER TABLE public.product_catalog_requests
  ADD CONSTRAINT product_catalog_requests_request_type_check
    CHECK (request_type IN ('sample_request', 'modification_request', 'order_request', 'quote_request'));

-- 2) Add columns to product_catalog_requests for storing brand selections
ALTER TABLE public.product_catalog_requests
  ADD COLUMN IF NOT EXISTS packaging_selection TEXT,
  ADD COLUMN IF NOT EXISTS accessory_selections TEXT,
  ADD COLUMN IF NOT EXISTS additional_comments TEXT;

-- 2) Clean up dummy request data for Nouriique → Private Label Cosmetics New York
-- Delete approved_products first (depends on source_request_id)
DELETE FROM public.approved_products
WHERE brand_id IN (SELECT id FROM public.brands WHERE name = 'Nouriique')
  AND manufacturer_id IN (SELECT id FROM public.manufacturer_profiles WHERE company_name = 'Private Label Cosmetics New York');

-- Delete conversation_messages for request-type messages in that conversation
DELETE FROM public.conversation_messages
WHERE conversation_id IN (
  SELECT c.id FROM public.conversations c
  WHERE c.brand_id IN (SELECT id FROM public.brands WHERE name = 'Nouriique')
    AND c.manufacturer_id IN (SELECT id FROM public.manufacturer_profiles WHERE company_name = 'Private Label Cosmetics New York')
)
AND message_type IN ('order_request', 'sample_request', 'quote_request');

-- Delete the request rows themselves
DELETE FROM public.product_catalog_requests
WHERE brand_id IN (SELECT id FROM public.brands WHERE name = 'Nouriique')
  AND manufacturer_id IN (SELECT id FROM public.manufacturer_profiles WHERE company_name = 'Private Label Cosmetics New York');
