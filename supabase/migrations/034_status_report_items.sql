-- ============================================================
-- 034: Status Report Items + in_progress PO status
-- ============================================================

-- 1) Widen PO status check to include 'in_progress'
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_status_check
  CHECK (status IN ('pending', 'in_progress', 'open', 'ready_for_pickup', 'completed'));

-- 2) Status report items table
CREATE TABLE IF NOT EXISTS public.status_report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  purchase_order_item_id uuid NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one status report entry per PO item (idempotency)
ALTER TABLE public.status_report_items
  ADD CONSTRAINT status_report_items_po_item_unique UNIQUE (purchase_order_item_id);

ALTER TABLE public.status_report_items ENABLE ROW LEVEL SECURITY;

-- Manufacturer can see their own status report items
CREATE POLICY "manufacturer_select_status_report_items"
  ON public.status_report_items FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer can insert their own status report items
CREATE POLICY "manufacturer_insert_status_report_items"
  ON public.status_report_items FOR INSERT
  WITH CHECK (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer can update their own status report items
CREATE POLICY "manufacturer_update_status_report_items"
  ON public.status_report_items FOR UPDATE
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

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_status_report_items_manufacturer
  ON public.status_report_items(manufacturer_id);

CREATE INDEX IF NOT EXISTS idx_status_report_items_po
  ON public.status_report_items(purchase_order_id);
