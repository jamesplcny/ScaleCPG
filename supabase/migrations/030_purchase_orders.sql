-- ============================================================
-- 030: Purchase Orders
-- ============================================================

-- 1) Purchase orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ready_for_pickup', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Brand users can see their own purchase orders
CREATE POLICY "brand_select_own_purchase_orders"
  ON public.purchase_orders FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Brand users can create purchase orders
CREATE POLICY "brand_insert_purchase_orders"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Manufacturer users can see purchase orders for their manufacturer
CREATE POLICY "manufacturer_select_purchase_orders"
  ON public.purchase_orders FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer users can update purchase order status
CREATE POLICY "manufacturer_update_purchase_orders"
  ON public.purchase_orders FOR UPDATE
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- 2) Purchase order line items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  approved_product_id uuid NOT NULL REFERENCES public.approved_products(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Line items inherit access from purchase order
CREATE POLICY "brand_select_own_po_items"
  ON public.purchase_order_items FOR SELECT
  USING (
    purchase_order_id IN (
      SELECT po.id FROM public.purchase_orders po
      WHERE po.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
    )
  );

CREATE POLICY "brand_insert_po_items"
  ON public.purchase_order_items FOR INSERT
  WITH CHECK (
    purchase_order_id IN (
      SELECT po.id FROM public.purchase_orders po
      WHERE po.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
    )
  );

CREATE POLICY "manufacturer_select_po_items"
  ON public.purchase_order_items FOR SELECT
  USING (
    purchase_order_id IN (
      SELECT po.id FROM public.purchase_orders po
      WHERE po.manufacturer_id IN (
        SELECT mp.id FROM public.manufacturer_profiles mp
        WHERE mp.user_id = auth.uid()
      )
    )
  );

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_brand_manufacturer
  ON public.purchase_orders(brand_id, manufacturer_id, status);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id
  ON public.purchase_order_items(purchase_order_id);
