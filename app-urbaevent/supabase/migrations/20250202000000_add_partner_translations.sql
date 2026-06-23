-- Add English translation columns to partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS category_en text,
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS sector_en text;

-- Add comments for clarity
COMMENT ON COLUMN partners.name_en IS 'English translation of partner name';
COMMENT ON COLUMN partners.category_en IS 'English translation of partner category';
COMMENT ON COLUMN partners.description_en IS 'English translation of partner description';
COMMENT ON COLUMN partners.sector_en IS 'English translation of partner sector';
