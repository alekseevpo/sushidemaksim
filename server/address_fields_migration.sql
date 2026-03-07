-- Add house and apartment columns to user_addresses
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS house TEXT;
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS apartment TEXT;
