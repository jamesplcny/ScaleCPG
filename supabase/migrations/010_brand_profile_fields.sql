-- Migration 010: Add website and primary_contact_name to brands table
-- Safe to re-run (idempotent via IF NOT EXISTS)

ALTER TABLE brands ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS primary_contact_name text NOT NULL DEFAULT '';
