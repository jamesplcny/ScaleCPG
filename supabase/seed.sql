-- ScaleCPG (LUMIERE) Seed Data
-- Populates all tables with sample data from the HTML prototype.

-- ============================================================================
-- 1. clients (8 active)
-- ============================================================================
INSERT INTO clients (id, name, slug, status, sku_count, message_count, accent_color, logo_bg, logo_color)
VALUES
  (gen_random_uuid(), 'Glow Botanics',      'glow-botanics',    'active', 34, 4, 'rose', '#E8C4BF', '#C4827A'),
  (gen_random_uuid(), 'Aura Beauty Co.',     'aura-beauty',      'active', 21, 2, 'gold', '#E8D5B5', '#B8965A'),
  (gen_random_uuid(), 'Nuit Skincare',       'nuit-skincare',    'active', 12, 1, 'plum', '#C9BBCE', '#8B7291'),
  (gen_random_uuid(), 'Rosé Cosmétique',     'rose-cosmetique',  'active',  8, 3, 'rose', '#E8C4BF', '#C4827A'),
  (gen_random_uuid(), 'Velvet & Vine',       'velvet-vine',      'active', 47, 0, 'sage', '#C5D1BC', '#8A9A7B'),
  (gen_random_uuid(), 'Halo Derma',          'halo-derma',       'active', 15, 2, 'gold', '#E8D5B5', '#B8965A'),
  (gen_random_uuid(), 'Bare Roots',          'bare-roots',       'active', 28, 1, 'sage', '#C5D1BC', '#8A9A7B'),
  (gen_random_uuid(), 'Soleil Labs',         'soleil-labs',      'active', 19, 0, 'gold', '#E8D5B5', '#B8965A');

-- ============================================================================
-- 2. client_applications (4 pending)
-- ============================================================================
INSERT INTO client_applications (id, brand_name, submission_date, status, accent_color, logo_bg, logo_color)
VALUES
  (gen_random_uuid(), 'Moonlit Skin',  'Jan 28, 2026', 'pending', 'plum', '#C9BBCE', '#8B7291'),
  (gen_random_uuid(), 'Flora & Fern',  'Feb 2, 2026',  'pending', 'sage', '#C5D1BC', '#8A9A7B'),
  (gen_random_uuid(), 'Luxe Matte',    'Feb 5, 2026',  'pending', 'rose', '#E8C4BF', '#C4827A'),
  (gen_random_uuid(), 'Terra Glow',    'Feb 7, 2026',  'pending', 'gold', '#E8D5B5', '#B8965A');

-- ============================================================================
-- 3. products (8)
-- ============================================================================
INSERT INTO products (id, name, category, description, price_min, price_max, moq, lead_time)
VALUES
  (gen_random_uuid(), 'Volumizing Biotin Shampoo',      'Shampoo',    'Sulfate-free formula with biotin, keratin proteins, and botanical extracts for fuller, thicker-looking hair.',                              4.20,  6.80,  500, '3–4 weeks'),
  (gen_random_uuid(), 'Clarifying Charcoal Shampoo',    'Shampoo',    'Deep-cleansing activated charcoal formula with tea tree oil. Removes buildup while maintaining moisture balance.',                             3.80,  5.90,  500, '3–4 weeks'),
  (gen_random_uuid(), 'Hydrating Argan Conditioner',    'Conditioner','Rich moisture conditioner with argan oil, shea butter, and silk amino acids for silky-smooth, frizz-free hair.',                              4.50,  7.20,  500, '3–4 weeks'),
  (gen_random_uuid(), 'Eucalyptus Mint Body Wash',      'Body Wash',  'Refreshing gel body wash with eucalyptus essential oil, peppermint, and aloe vera. Gentle enough for daily use.',                             3.20,  5.10, 1000, '2–3 weeks'),
  (gen_random_uuid(), 'Vitamin C Brightening Serum',    'Skincare',   '20% L-Ascorbic Acid serum with ferulic acid and vitamin E. Targets dark spots and uneven skin tone.',                                         8.50, 12.00,  250, '4–5 weeks'),
  (gen_random_uuid(), 'Retinol Night Cream',            'Skincare',   'Advanced anti-aging night cream with retinol 0.5%, squalane, and ceramides. Supports cell turnover while you sleep.',                         7.80, 11.50,  250, '4–5 weeks'),
  (gen_random_uuid(), 'Mineral Sunscreen SPF 50',       'Sun Care',   'Broad spectrum mineral SPF with zinc oxide and titanium dioxide. Lightweight, non-greasy finish with no white cast.',                         6.50,  9.80,  500, '5–6 weeks'),
  (gen_random_uuid(), 'Lavender Oat Milk Body Wash',    'Body Wash',  'Soothing body wash with colloidal oatmeal, lavender essential oil, and coconut-derived surfactants. Ultra-gentle formula.',                   3.40,  5.50, 1000, '2–3 weeks');

-- ============================================================================
-- 4. orders (10) — uses subqueries to look up client_id by slug
-- ============================================================================
INSERT INTO orders (id, order_number, client_id, client_name, product_name, quantity, status, requested_date)
VALUES
  (gen_random_uuid(), 'ORD-2471', (SELECT id FROM clients WHERE slug = 'glow-botanics'),   'Glow Botanics',      'Vitamin C Brightening Serum',    2500, 'pending',    'Feb 8, 2026'),
  (gen_random_uuid(), 'ORD-2470', (SELECT id FROM clients WHERE slug = 'aura-beauty'),     'Aura Beauty Co.',     'Mineral Sunscreen SPF 50',       5000, 'approved',   'Feb 7, 2026'),
  (gen_random_uuid(), 'ORD-2469', (SELECT id FROM clients WHERE slug = 'nuit-skincare'),   'Nuit Skincare',       'Retinol Night Cream',            4200, 'shipped',    'Feb 6, 2026'),
  (gen_random_uuid(), 'ORD-2468', (SELECT id FROM clients WHERE slug = 'velvet-vine'),     'Velvet & Vine',       'Botanical Cleansing Oil',        1800, 'production', 'Feb 6, 2026'),
  (gen_random_uuid(), 'ORD-2467', (SELECT id FROM clients WHERE slug = 'bare-roots'),      'Bare Roots',          'Clarifying Charcoal Shampoo',    3000, 'pending',    'Feb 5, 2026'),
  (gen_random_uuid(), 'ORD-2466', (SELECT id FROM clients WHERE slug = 'halo-derma'),      'Halo Derma',          'Hydrating Argan Conditioner',    2000, 'production', 'Feb 5, 2026'),
  (gen_random_uuid(), 'ORD-2465', (SELECT id FROM clients WHERE slug = 'rose-cosmetique'), 'Rosé Cosmétique',     'Lavender Oat Milk Body Wash',    6000, 'pending',    'Feb 4, 2026'),
  (gen_random_uuid(), 'ORD-2464', (SELECT id FROM clients WHERE slug = 'soleil-labs'),     'Soleil Labs',         'Mineral Sunscreen SPF 50',       8000, 'approved',   'Feb 3, 2026'),
  (gen_random_uuid(), 'ORD-2463', (SELECT id FROM clients WHERE slug = 'glow-botanics'),   'Glow Botanics',       'Eucalyptus Mint Body Wash',      4500, 'shipped',    'Feb 2, 2026'),
  (gen_random_uuid(), 'ORD-2462', (SELECT id FROM clients WHERE slug = 'aura-beauty'),     'Aura Beauty Co.',     'Volumizing Biotin Shampoo',      3500, 'production', 'Feb 1, 2026');

-- ============================================================================
-- 5. inventory_items (10)
-- ============================================================================
INSERT INTO inventory_items (id, name, description, sku, category, stock_qty, stock_pct, stock_level, status, on_order)
VALUES
  (gen_random_uuid(), 'Hyaluronic Acid (Sodium Hyaluronate)',  'High molecular weight, cosmetic grade',      'RM-0142', 'Raw Material',    '1.2 kg',      12, 'low',    'critical',   false),
  (gen_random_uuid(), 'L-Ascorbic Acid (Vitamin C)',           'USP grade, powder form',                     'RM-0089', 'Raw Material',    '2.8 kg',      18, 'low',    'critical',   false),
  (gen_random_uuid(), 'Niacinamide (Vitamin B3)',              'Cosmetic grade, powder',                     'RM-0201', 'Raw Material',    '5.4 kg',      35, 'medium', 'low-stock',  false),
  (gen_random_uuid(), 'Zinc Oxide (Non-nano)',                 'Uncoated, SPF active',                       'RM-0067', 'Raw Material',    '8.1 kg',      40, 'medium', 'low-stock',  false),
  (gen_random_uuid(), '30ml Frosted Glass Dropper Bottles',    'Rose gold cap, child-resistant',             'PK-0312', 'Packaging',       '480 units',   15, 'low',    'critical',   true),
  (gen_random_uuid(), 'Squalane (Olive-derived)',              'Cosmetic grade, liquid',                     'RM-0156', 'Raw Material',    '14.2 L',      72, 'high',   'in-stock',   false),
  (gen_random_uuid(), '50ml Airless Pump Bottles',             'Matte white, PCR plastic',                   'PK-0287', 'Packaging',       '3,200 units', 85, 'high',   'in-stock',   false),
  (gen_random_uuid(), 'Retinol Night Cream — Nuit Skincare',   'Batch #NK-1183, finished product',           'FG-0091', 'Finished Goods',  '1,800 units', 45, 'medium', 'in-stock',   false),
  (gen_random_uuid(), 'Ceramide NP',                           'Synthetic, cosmetic grade',                  'RM-0224', 'Raw Material',    '3.8 kg',      65, 'high',   'in-stock',   false),
  (gen_random_uuid(), 'Ferulic Acid',                          'Natural source, antioxidant',                'RM-0178', 'Raw Material',    '1.5 kg',      30, 'medium', 'low-stock',  true);

-- ============================================================================
-- 6. alerts (3)
-- ============================================================================
INSERT INTO alerts (id, title, description, severity)
VALUES
  (gen_random_uuid(), 'Hyaluronic Acid below minimum threshold',  'Current stock: 1.2 kg. Minimum threshold: 5 kg. This ingredient is used across 14 active formulations. Immediate reorder recommended.',               'critical'),
  (gen_random_uuid(), 'Dropper bottles running critically low',   'Only 480 units remaining of 30ml frosted glass droppers. Order placed Feb 6 — expected delivery Feb 14. Monitor Glow Botanics production schedule.', 'critical'),
  (gen_random_uuid(), 'L-Ascorbic Acid approaching minimum',     'Current stock: 2.8 kg. At current usage rate, stock will be depleted within 10 days. Consider placing a reorder soon.',                               'warning');

-- ============================================================================
-- 7. formulations (6) — uses ARRAY[] for text[] columns
-- ============================================================================
INSERT INTO formulations (id, name, category, subtitle, ingredients, packaging_options, add_ons)
VALUES
  (gen_random_uuid(),
    'PLCNY Natural Shampoo', 'Haircare',
    'Sulfate-free gentle cleansing base · 12 oz standard',
    ARRAY['Aqua','Cocamidopropyl Betaine','Sodium Cocoyl Isethionate','Glycerin','Aloe Barbadensis Leaf Juice','Panthenol (B5)','Citric Acid','Phenoxyethanol'],
    ARRAY['250ml Bottle','500ml Pump','1L Refill Pouch'],
    ARRAY['Tea Tree Oil','Argan Oil','Keratin Complex','Biotin','Lavender Extract','Charcoal Powder']),

  (gen_random_uuid(),
    'Silk Protein Conditioner', 'Haircare',
    'Deep hydration repair base · 10 oz standard',
    ARRAY['Aqua','Cetearyl Alcohol','Behentrimonium Methosulfate','Hydrolyzed Silk Protein','Shea Butter','Jojoba Oil','Tocopherol (Vitamin E)'],
    ARRAY['300ml Tube','500ml Pump','16 oz Jar'],
    ARRAY['Coconut Oil','Avocado Extract','Rice Protein','Peppermint Oil','Collagen Peptides']),

  (gen_random_uuid(),
    'Botanical Face Cream', 'Skincare',
    'Lightweight daily moisturizer base · 2 oz standard',
    ARRAY['Aqua','Squalane','Hyaluronic Acid','Cetyl Alcohol','Niacinamide','Aloe Vera Extract','Phenoxyethanol'],
    ARRAY['50ml Glass Jar','30ml Airless Pump','100ml Tube'],
    ARRAY['Retinol 0.3%','Vitamin C','Bakuchiol','Peptide Complex','Ceramide NP']),

  (gen_random_uuid(),
    'Hydrating Body Lotion', 'Bodycare',
    'All-over moisture base · 8 oz standard',
    ARRAY['Aqua','Shea Butter','Glycerin','Cetearyl Alcohol','Sunflower Seed Oil','Aloe Barbadensis','Tocopherol'],
    ARRAY['250ml Pump','500ml Bottle','200ml Tube'],
    ARRAY['CBD Extract','Rose Hip Oil','Cocoa Butter','Oat Extract','Vanilla Fragrance']),

  (gen_random_uuid(),
    'Mineral Sunscreen Base', 'Suncare',
    'SPF 50 reef-safe formula · 3 oz standard',
    ARRAY['Zinc Oxide 20%','Aqua','Caprylic/Capric Triglyceride','Squalane','Cetyl Alcohol','Iron Oxides'],
    ARRAY['50ml Tube','80ml Stick','100ml Pump'],
    ARRAY['Tinted Pigment','Vitamin E','Green Tea Extract','Hyaluronic Acid']),

  (gen_random_uuid(),
    'Exfoliating Sugar Scrub', 'Bodycare',
    'Gentle physical exfoliant base · 6 oz standard',
    ARRAY['Sucrose (Sugar Crystals)','Coconut Oil','Sweet Almond Oil','Shea Butter','Vitamin E','Glycerin'],
    ARRAY['200ml Glass Jar','300ml Tub'],
    ARRAY['Coffee Grounds','Charcoal Powder','Lemon Zest','Rose Petals','Eucalyptus Oil']);

-- ============================================================================
-- 8. activities (5)
-- ============================================================================
INSERT INTO activities (id, type, title, description, accent_color, time_label)
VALUES
  (gen_random_uuid(), 'message',  'New message from Glow Botanics',           'Requested revision on Vitamin C serum formulation — batch #GB-2247',                        'rose', '12 min ago'),
  (gen_random_uuid(), 'approval', 'Product approved — Velvet Skin SPF 50',    'QA passed for Aura Beauty Co. Moving to production phase.',                                  'sage', '1 hr ago'),
  (gen_random_uuid(), 'alert',    'Inventory alert — Hyaluronic Acid',        'Stock dropped below minimum threshold. Reorder recommended.',                                 'plum', '3 hrs ago'),
  (gen_random_uuid(), 'onboard',  'New client onboarded — Rosé Cosmétique',   'Contract signed. Initial consultation scheduled for Feb 10.',                                 'gold', 'Yesterday'),
  (gen_random_uuid(), 'shipment', 'Batch #NK-1183 shipped — Nuit Skincare',   '4,200 units of Retinol Night Cream dispatched to fulfillment center.',                        'sage', 'Yesterday');

-- ============================================================================
-- 9. client_products for Glow Botanics (6)
-- ============================================================================
INSERT INTO client_products (id, client_id, sku, product_name, category, status, volume)
VALUES
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1001', 'Vitamin C Brightening Serum', 'Skincare', 'In Production', '4,200/mo'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1002', 'Hyaluronic Acid Toner',       'Skincare', 'In Production', '3,800/mo'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1003', 'Rose Petal Face Mist',        'Skincare', 'Approved',      '2,500/mo'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1004', 'Retinol Night Cream',         'Skincare', 'Pending QA',    '1,800/mo'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1005', 'Green Tea Cleanser',          'Skincare', 'In Production', '5,100/mo'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'GB-1006', 'Niacinamide Serum',           'Skincare', 'Approved',      '3,200/mo');

-- ============================================================================
-- 10. client_orders for Glow Botanics (4)
-- ============================================================================
INSERT INTO client_orders (id, client_id, order_number, product_name, quantity, requested_date, status)
VALUES
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'ORD-4401', 'Vitamin C Brightening Serum', '8,400 units',  'Feb 15, 2026', 'Processing'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'ORD-4402', 'Green Tea Cleanser',          '10,200 units', 'Feb 18, 2026', 'Confirmed'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'ORD-4403', 'Rose Petal Face Mist',        '5,000 units',  'Feb 22, 2026', 'Pending'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'ORD-4404', 'Hyaluronic Acid Toner',       '7,600 units',  'Mar 1, 2026',  'Pending');

-- ============================================================================
-- 11. client_messages for Glow Botanics (4)
-- ============================================================================
INSERT INTO client_messages (id, client_id, from_name, subject, sent_date, status)
VALUES
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'Sarah Chen (Glow Botanics)', 'Re: Vitamin C Serum formulation revision — batch #GB-2247', 'Feb 9, 2026', 'Unread'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'Sarah Chen (Glow Botanics)', 'Packaging artwork approval needed',                          'Feb 8, 2026', 'Unread'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'Mark Liu (Glow Botanics)',   'Q1 order volume forecast update',                            'Feb 7, 2026', 'Unread'),
  (gen_random_uuid(), (SELECT id FROM clients WHERE slug = 'glow-botanics'), 'Sarah Chen (Glow Botanics)', 'Re: Green Tea Cleanser sample feedback',                      'Feb 5, 2026', 'Read');
