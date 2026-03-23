-- ============================================================
-- 038: Add lot_number to status_report_items
-- ============================================================

ALTER TABLE public.status_report_items
  ADD COLUMN IF NOT EXISTS lot_number text;
