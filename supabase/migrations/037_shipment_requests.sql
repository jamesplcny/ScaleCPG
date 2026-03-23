-- ============================================================
-- 037: Shipment Requests (brand-created, manufacturer-fulfilled)
-- ============================================================

-- 1) Shipment requests table
CREATE TABLE IF NOT EXISTS public.shipment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  shipping_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Junction: which status_report_items belong to which shipment request
CREATE TABLE IF NOT EXISTS public.shipment_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_request_id uuid NOT NULL REFERENCES public.shipment_requests(id) ON DELETE CASCADE,
  status_report_item_id uuid NOT NULL REFERENCES public.status_report_items(id) ON DELETE CASCADE
);

-- Each status report item can only be in one shipment request
ALTER TABLE public.shipment_request_items
  ADD CONSTRAINT shipment_request_items_sr_item_unique UNIQUE (status_report_item_id);

-- 3) RLS
ALTER TABLE public.shipment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_request_items ENABLE ROW LEVEL SECURITY;

-- Manufacturer can see + update their own shipment requests
CREATE POLICY "manufacturer_select_shipment_requests"
  ON public.shipment_requests FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp WHERE mp.user_id = auth.uid()
    )
  );

CREATE POLICY "manufacturer_update_shipment_requests"
  ON public.shipment_requests FOR UPDATE
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp WHERE mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp WHERE mp.user_id = auth.uid()
    )
  );

-- Brand can create + see their own shipment requests
CREATE POLICY "brand_insert_shipment_requests"
  ON public.shipment_requests FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

CREATE POLICY "brand_select_shipment_requests"
  ON public.shipment_requests FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Shipment request items: manufacturer can see via parent
CREATE POLICY "manufacturer_select_shipment_request_items"
  ON public.shipment_request_items FOR SELECT
  USING (
    shipment_request_id IN (
      SELECT sr.id FROM public.shipment_requests sr
      WHERE sr.manufacturer_id IN (
        SELECT mp.id FROM public.manufacturer_profiles mp WHERE mp.user_id = auth.uid()
      )
    )
  );

-- Shipment request items: brand can insert + see via parent
CREATE POLICY "brand_insert_shipment_request_items"
  ON public.shipment_request_items FOR INSERT
  WITH CHECK (
    shipment_request_id IN (
      SELECT sr.id FROM public.shipment_requests sr
      WHERE sr.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
    )
  );

CREATE POLICY "brand_select_shipment_request_items"
  ON public.shipment_request_items FOR SELECT
  USING (
    shipment_request_id IN (
      SELECT sr.id FROM public.shipment_requests sr
      WHERE sr.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
    )
  );

-- 4) Indexes
CREATE INDEX IF NOT EXISTS idx_shipment_requests_manufacturer ON public.shipment_requests(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_brand ON public.shipment_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_shipment_request_items_request ON public.shipment_request_items(shipment_request_id);
CREATE INDEX IF NOT EXISTS idx_shipment_request_items_sr_item ON public.shipment_request_items(status_report_item_id);
