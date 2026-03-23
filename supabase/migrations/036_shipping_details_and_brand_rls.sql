-- ============================================================
-- 036: Shipping details on status_report_items + brand SELECT
-- ============================================================

-- 1) Add shipping detail columns to status_report_items
ALTER TABLE public.status_report_items
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS box_length numeric,
  ADD COLUMN IF NOT EXISTS box_width numeric,
  ADD COLUMN IF NOT EXISTS box_height numeric,
  ADD COLUMN IF NOT EXISTS box_weight numeric,
  ADD COLUMN IF NOT EXISTS box_count integer,
  ADD COLUMN IF NOT EXISTS pallet_length numeric,
  ADD COLUMN IF NOT EXISTS pallet_width numeric,
  ADD COLUMN IF NOT EXISTS pallet_height numeric,
  ADD COLUMN IF NOT EXISTS pallet_weight numeric,
  ADD COLUMN IF NOT EXISTS pallet_count integer,
  ADD COLUMN IF NOT EXISTS expiration_date text,
  ADD COLUMN IF NOT EXISTS shipping_sent_at timestamptz;

-- 2) Brand can read status report items for their own brand
CREATE POLICY "brand_select_status_report_items"
  ON public.status_report_items FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );
