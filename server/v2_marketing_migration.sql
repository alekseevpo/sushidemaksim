-- Add new marketing and dietary columns to menu_items
-- Run this in your Supabase SQL Editor

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- Optional: Tag some popular items manually (example IDs)
-- UPDATE menu_items SET is_popular = true WHERE id IN (19, 22, 50);

-- Optional: Add allergens to some items
-- UPDATE menu_items SET allergens = ARRAY['gluten', 'fish'] WHERE id = 19;
