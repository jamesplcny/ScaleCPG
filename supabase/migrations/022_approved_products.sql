-- ============================================================
-- 022: Approved Products table
-- ============================================================

-- Stores products approved by manufacturers for brands
CREATE TABLE IF NOT EXISTS public.approved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  source_request_id uuid REFERENCES public.product_catalog_requests(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  ingredient_list text NOT NULL DEFAULT '',
  packaging text NOT NULL DEFAULT '',
  price_per_unit numeric,
  note text,
  status text NOT NULL DEFAULT 'new',
  approved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.approved_products ENABLE ROW LEVEL SECURITY;

-- Brand can SELECT own approved products
CREATE POLICY "brand_select_approved_products"
  ON public.approved_products FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Manufacturer can SELECT approved products they created
CREATE POLICY "manufacturer_select_approved_products"
  ON public.approved_products FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer can INSERT approved products
CREATE POLICY "manufacturer_insert_approved_products"
  ON public.approved_products FOR INSERT
  WITH CHECK (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer can UPDATE request status (for approve/deny)
CREATE POLICY "manufacturer_update_requests"
  ON public.product_catalog_requests FOR UPDATE
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approved_products_brand
  ON public.approved_products(brand_id, manufacturer_id);

CREATE INDEX IF NOT EXISTS idx_approved_products_mfg
  ON public.approved_products(manufacturer_id, brand_id);
