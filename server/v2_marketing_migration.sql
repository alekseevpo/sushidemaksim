-- Add new marketing and dietary columns to menu_items
-- Run this in your Supabase SQL Editor

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_chef_choice BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- Optional: Tag some items for demo
-- UPDATE menu_items SET is_popular = true, is_chef_choice = true WHERE id = 19;
-- UPDATE menu_items SET is_new = true WHERE id = 109;
