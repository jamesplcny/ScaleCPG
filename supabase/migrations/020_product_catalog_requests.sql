-- ============================================================
-- 020: Product Catalog Requests + Chat message types
-- ============================================================

-- 1) Extend conversation_messages with message_type and metadata
ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- 2) Product catalog requests table
CREATE TABLE IF NOT EXISTS public.product_catalog_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  popular_item_id uuid REFERENCES public.popular_vault_items(id) ON DELETE SET NULL,
  request_type text NOT NULL CHECK (request_type IN ('sample_request', 'modification_request')),
  item_name text NOT NULL,
  request_body text NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_catalog_requests ENABLE ROW LEVEL SECURITY;

-- Brand can SELECT own requests
CREATE POLICY "brand_select_own_requests"
  ON public.product_catalog_requests FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Brand can INSERT requests
CREATE POLICY "brand_insert_own_requests"
  ON public.product_catalog_requests FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Manufacturer can SELECT requests addressed to them
CREATE POLICY "manufacturer_select_own_requests"
  ON public.product_catalog_requests FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- 3) Allow brands to read popular_vault_items for accepted manufacturers
CREATE POLICY "brands_read_accepted_mfg_popular_items"
  ON public.popular_vault_items FOR SELECT
  USING (
    user_id IN (
      SELECT mp.user_id FROM public.manufacturer_profiles mp
      WHERE mp.id IN (
        SELECT bma.manufacturer_id FROM public.brand_manufacturer_applications bma
        WHERE bma.status = 'accepted'
        AND bma.brand_id IN (
          SELECT bu.brand_id FROM public.brand_users bu
          WHERE bu.user_id = auth.uid() AND bu.status = 'active'
        )
      )
    )
  );

-- 4) Allow brands to read packaging_vault_items for accepted manufacturers
CREATE POLICY "brands_read_accepted_mfg_packaging_items"
  ON public.packaging_vault_items FOR SELECT
  USING (
    user_id IN (
      SELECT mp.user_id FROM public.manufacturer_profiles mp
      WHERE mp.id IN (
        SELECT bma.manufacturer_id FROM public.brand_manufacturer_applications bma
        WHERE bma.status = 'accepted'
        AND bma.brand_id IN (
          SELECT bu.brand_id FROM public.brand_users bu
          WHERE bu.user_id = auth.uid() AND bu.status = 'active'
        )
      )
    )
  );

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_product_catalog_requests_brand
  ON public.product_catalog_requests(brand_id, manufacturer_id);

CREATE INDEX IF NOT EXISTS idx_product_catalog_requests_mfg
  ON public.product_catalog_requests(manufacturer_id, brand_id);
