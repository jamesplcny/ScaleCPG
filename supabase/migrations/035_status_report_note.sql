-- Add note column to status_report_items for delay/reject reasons
ALTER TABLE public.status_report_items
  ADD COLUMN IF NOT EXISTS note text;
