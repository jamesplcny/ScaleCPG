-- ============================================================
-- 023: Brand request lifecycle — resend + add to products
-- ============================================================

-- Brand can UPDATE own requests (for editing & resending denied requests)
CREATE POLICY "brand_update_own_requests"
  ON public.product_catalog_requests FOR UPDATE
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Brand can UPDATE own approved products (for adding to current products)
CREATE POLICY "brand_update_approved_products"
  ON public.approved_products FOR UPDATE
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );
