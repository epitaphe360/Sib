-- ============================================================
-- Remplacement des références "siport" dans les templates email
-- ============================================================

UPDATE email_templates
SET
  subject      = REPLACE(REPLACE(REPLACE(subject,      'siport', 'SIB'), 'Siport', 'SIB'), 'SIPORT', 'SIB'),
  html_content = REPLACE(REPLACE(REPLACE(html_content, 'siport', 'SIB - Salon International du Bâtiment'), 'Siport', 'SIB - Salon International du Bâtiment'), 'SIPORT', 'SIB - Salon International du Bâtiment'),
  text_content = REPLACE(REPLACE(REPLACE(text_content, 'siport', 'SIB - Salon International du Bâtiment'), 'Siport', 'SIB - Salon International du Bâtiment'), 'SIPORT', 'SIB - Salon International du Bâtiment'),
  name         = REPLACE(REPLACE(REPLACE(name,         'siport', 'SIB'), 'Siport', 'SIB'), 'SIPORT', 'SIB'),
  description  = REPLACE(REPLACE(REPLACE(description,  'siport', 'SIB - Salon International du Bâtiment'), 'Siport', 'SIB - Salon International du Bâtiment'), 'SIPORT', 'SIB - Salon International du Bâtiment'),
  updated_at   = NOW()
WHERE
  subject      ILIKE '%siport%'
  OR html_content ILIKE '%siport%'
  OR text_content ILIKE '%siport%'
  OR name         ILIKE '%siport%'
  OR description  ILIKE '%siport%';
