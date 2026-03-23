-- Add sales_channels and product_categories columns to brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS sales_channels text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS product_categories text[] DEFAULT '{}';
