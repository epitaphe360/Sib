-- ============================================================
-- Correction des dates et lieu du salon dans les templates email
-- Dates correctes : 25-29 Novembre 2026, El Jadida, Maroc
-- ============================================================

UPDATE email_templates
SET
  html_content = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    html_content,
    '15-18 Avril 2026',        '25-29 Novembre 2026'),
    '15 au 18 Avril 2026',     '25 au 29 Novembre 2026'),
    '15-18 avril 2026',        '25-29 Novembre 2026'),
    'Parc des Expositions de Casablanca', 'Parc d''Exposition Mohammed VI, El Jadida'),
    'Parc des Expositions, Casablanca',   'Parc d''Exposition Mohammed VI, El Jadida'),
    'Casablanca, Maroc',                  'El Jadida, Maroc'),
  text_content = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    text_content,
    '15-18 Avril 2026',        '25-29 Novembre 2026'),
    '15 au 18 Avril 2026',     '25 au 29 Novembre 2026'),
    '15-18 avril 2026',        '25-29 Novembre 2026'),
    'Parc des Expositions de Casablanca', 'Parc d''Exposition Mohammed VI, El Jadida'),
    'Parc des Expositions, Casablanca',   'Parc d''Exposition Mohammed VI, El Jadida'),
    'Casablanca, Maroc',                  'El Jadida, Maroc'),
  updated_at = NOW()
WHERE
  html_content ILIKE '%Avril 2026%'
  OR html_content ILIKE '%Casablanca%'
  OR text_content ILIKE '%Avril 2026%'
  OR text_content ILIKE '%Casablanca%';
