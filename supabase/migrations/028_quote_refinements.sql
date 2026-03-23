-- ============================================================
-- 028: Quote refinements — accessories on approved_products
-- ============================================================

-- Add accessories column to approved_products for storing accessory info in quotes
ALTER TABLE public.approved_products
  ADD COLUMN IF NOT EXISTS accessories TEXT;

-- Brand needs DELETE on approved_products for modification requests / decline
CREATE POLICY "brand_delete_own_approved_products"
  ON public.approved_products FOR DELETE
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );
