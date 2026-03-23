-- Ingredient Vault Items
CREATE TABLE IF NOT EXISTS ingredient_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inci_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ingredient_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ingredient vault items"
  ON ingredient_vault_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Packaging Vault Items
CREATE TABLE IF NOT EXISTS packaging_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  packaging_type TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE packaging_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own packaging vault items"
  ON packaging_vault_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
