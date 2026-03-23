-- ============================================================
-- 024: Accessory Vault + Product Catalog refactor
-- ============================================================

-- 1) Accessory vault table (mirrors packaging_vault_items pattern)
CREATE TABLE IF NOT EXISTS public.accessory_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accessory_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accessory vault items"
  ON public.accessory_vault_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Brand read access for accessory vault items (same pattern as packaging/popular)
CREATE POLICY "brands_read_accepted_mfg_accessory_items"
  ON public.accessory_vault_items FOR SELECT
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

CREATE INDEX idx_accessory_vault_items_user_id ON public.accessory_vault_items(user_id);

-- 2) Extend popular_vault_items with new Product Catalog fields
ALTER TABLE public.popular_vault_items
  ADD COLUMN IF NOT EXISTS selling_points TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS packaging_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accessory_ids UUID[] NOT NULL DEFAULT '{}';

-- 3) Migrate existing single packaging FK → packaging_ids array
UPDATE public.popular_vault_items
  SET packaging_ids = ARRAY[packaging_vault_item_id]
  WHERE packaging_vault_item_id IS NOT NULL
    AND packaging_ids = '{}';

-- 4) Drop old single packaging FK (replaced by packaging_ids array)
ALTER TABLE public.popular_vault_items
  DROP COLUMN IF EXISTS packaging_vault_item_id;
