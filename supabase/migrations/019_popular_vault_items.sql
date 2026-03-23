-- Popular Vault Items
CREATE TABLE IF NOT EXISTS popular_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  ingredient_list TEXT NOT NULL,
  packaging_vault_item_id UUID REFERENCES packaging_vault_items(id) ON DELETE SET NULL,
  price_min NUMERIC(10,2),
  price_max NUMERIC(10,2),
  moq INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT price_range_valid CHECK (
    price_min IS NULL OR price_max IS NULL OR price_min <= price_max
  ),
  CONSTRAINT moq_nonneg CHECK (moq >= 0)
);

ALTER TABLE popular_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own popular vault items"
  ON popular_vault_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_popular_vault_items_user_id ON popular_vault_items(user_id);
