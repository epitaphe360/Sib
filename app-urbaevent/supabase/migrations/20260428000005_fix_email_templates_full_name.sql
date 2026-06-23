-- ============================================================
-- Remplacement du nom complet "Salon International des Ports..."
-- par "Salon International du Bâtiment" dans les templates email
-- ============================================================

UPDATE email_templates
SET
  subject = REPLACE(subject,
    'Salon International des Ports et de la Logistique Maritime',
    'Salon International du Bâtiment'),
  html_content = REPLACE(
    REPLACE(html_content,
      'Salon International des Ports et de la Logistique Maritime (SIB - Salon International du Bâtiment)',
      'Salon International du Bâtiment (SIB)'),
    'Salon International des Ports et de la Logistique Maritime',
    'Salon International du Bâtiment'),
  text_content = REPLACE(
    REPLACE(text_content,
      'Salon International des Ports et de la Logistique Maritime (SIB - Salon International du Bâtiment)',
      'Salon International du Bâtiment (SIB)'),
    'Salon International des Ports et de la Logistique Maritime',
    'Salon International du Bâtiment'),
  description = REPLACE(description,
    'Salon International des Ports et de la Logistique Maritime',
    'Salon International du Bâtiment'),
  updated_at = NOW()
WHERE
  html_content ILIKE '%Salon International des Ports%'
  OR text_content ILIKE '%Salon International des Ports%'
  OR subject     ILIKE '%Salon International des Ports%'
  OR description ILIKE '%Salon International des Ports%';

-- Nettoyer aussi le doublon "(SIB - Salon International du BâtimentS)"
-- qui peut s'être formé lors de la migration précédente
UPDATE email_templates
SET
  html_content = REPLACE(html_content,
    'SIB - Salon International du BâtimentS',
    'SIB - Salon International du Bâtiment'),
  text_content = REPLACE(text_content,
    'SIB - Salon International du BâtimentS',
    'SIB - Salon International du Bâtiment'),
  updated_at = NOW()
WHERE
  html_content LIKE '%SIB - Salon International du BâtimentS%'
  OR text_content LIKE '%SIB - Salon International du BâtimentS%';
