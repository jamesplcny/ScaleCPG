-- Brand → Manufacturer application table
CREATE TABLE IF NOT EXISTS public.brand_manufacturer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  tell_us_about_yourself text NOT NULL DEFAULT '',
  what_are_you_looking_for text NOT NULL DEFAULT '',
  already_selling boolean NOT NULL DEFAULT false,
  selling_details text,
  packaging_preference text NOT NULL DEFAULT '',
  expected_order_quantity text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One application per brand per manufacturer
ALTER TABLE public.brand_manufacturer_applications
  DROP CONSTRAINT IF EXISTS brand_manufacturer_applications_brand_manufacturer_unique;
ALTER TABLE public.brand_manufacturer_applications
  ADD CONSTRAINT brand_manufacturer_applications_brand_manufacturer_unique
  UNIQUE (brand_id, manufacturer_id);

-- Enable RLS
ALTER TABLE public.brand_manufacturer_applications ENABLE ROW LEVEL SECURITY;

-- Brand users can INSERT applications for their own brand
DROP POLICY IF EXISTS "brand_insert_own_applications" ON public.brand_manufacturer_applications;
CREATE POLICY "brand_insert_own_applications"
  ON public.brand_manufacturer_applications
  FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Brand users can SELECT their own applications
DROP POLICY IF EXISTS "brand_select_own_applications" ON public.brand_manufacturer_applications;
CREATE POLICY "brand_select_own_applications"
  ON public.brand_manufacturer_applications
  FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Manufacturer users can SELECT applications for their manufacturer profile
DROP POLICY IF EXISTS "manufacturer_select_own_applications" ON public.brand_manufacturer_applications;
CREATE POLICY "manufacturer_select_own_applications"
  ON public.brand_manufacturer_applications
  FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer users can UPDATE status on their own applications
DROP POLICY IF EXISTS "manufacturer_update_own_applications" ON public.brand_manufacturer_applications;
CREATE POLICY "manufacturer_update_own_applications"
  ON public.brand_manufacturer_applications
  FOR UPDATE
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
