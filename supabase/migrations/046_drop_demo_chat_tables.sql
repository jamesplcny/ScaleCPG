-- Drop the demo chat tables added by 045_demo_chat_tables.sql.
-- The Booking Demos admin feature has been removed.

DROP TABLE IF EXISTS demo_chat_messages CASCADE;
DROP TABLE IF EXISTS demo_chat_sessions CASCADE;
DROP TABLE IF EXISTS demo_chat_config CASCADE;
