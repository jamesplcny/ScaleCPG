-- Add how_to_use text field to popular_vault_items (Product Catalog)
ALTER TABLE public.popular_vault_items
  ADD COLUMN IF NOT EXISTS how_to_use TEXT NOT NULL DEFAULT '';
