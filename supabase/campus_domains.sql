-- Add domain validation to campuses
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS domain TEXT;

-- Update existing campus domains
UPDATE campuses SET domain = 'veritas.edu.ng' WHERE slug = 'veritas';
UPDATE campuses SET domain = 'unilag.edu.ng' WHERE slug = 'unilag';
UPDATE campuses SET domain = 'ui.edu.ng' WHERE slug = 'ui';
UPDATE campuses SET domain = 'covenantuniversity.edu.ng' WHERE slug = 'covenant';
