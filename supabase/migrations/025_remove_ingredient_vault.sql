-- Safe removal: ingredient_vault_items has no foreign key references from other tables
DROP TABLE IF EXISTS ingredient_vault_items;

-- Note: products, profile_skus, and client_products tables are NOT dropped here
-- because profile_skus has a hard FK on products.product_id (ON DELETE CASCADE).
-- These tables can be dropped in a future migration after verifying no data loss.
