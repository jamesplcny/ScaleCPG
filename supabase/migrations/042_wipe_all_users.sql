-- ============================================================
-- WIPE ALL EXISTING USERS AND RELATED DATA
-- Run in Supabase SQL Editor
-- Uses DO block to skip tables that don't exist
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- Child tables first (respect FK constraints)
    'shipment_request_items',
    'shipment_requests',
    'status_report_items',
    'purchase_order_items',
    'purchase_orders',
    'product_catalog_requests',
    'approved_products',
    'brand_manufacturer_applications',
    'conversation_messages',
    'conversations',
    'popular_vault_items',
    'packaging_vault_items',
    'accessory_vault_items',
    'manufacturer_capabilities',
    'profile_skus',
    'manufacturer_profiles',
    'client_products',
    'client_users',
    'clients',
    'brand_products',
    'brand_users',
    'brands',
    'orders',
    'inventory_items',
    'products',
    'categories',
    'ups_shipments',
    'formulations',
    'activities',
    'alerts',
    'admin_manufacturer_invitations',
    'admin_manufacturers',
    'user_roles'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('DELETE FROM public.%I', t);
      RAISE NOTICE 'Cleared %', t;
    ELSE
      RAISE NOTICE 'Skipped % (does not exist)', t;
    END IF;
  END LOOP;
END $$;

-- Delete all auth users
DELETE FROM auth.users;
