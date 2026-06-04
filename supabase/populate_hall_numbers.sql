UPDATE public.exhibitors
SET hall_number = UPPER(SUBSTRING(TRIM(stand_number) FROM 1 FOR 1))
WHERE (hall_number IS NULL OR hall_number = '')
  AND stand_number IS NOT NULL
  AND TRIM(stand_number) <> ''
  AND UPPER(SUBSTRING(TRIM(stand_number) FROM 1 FOR 1)) IN ('A', 'B', 'C', 'D');

UPDATE public.exhibitors
SET hall_number = CASE
  WHEN sector ILIKE '%gros%' OR sector ILIKE '%structure%' OR sector ILIKE '%bâtiment%' OR sector ILIKE '%btp%' OR sector ILIKE '%matériaux de construction%' THEN 'A'
  WHEN sector ILIKE '%finition%' OR sector ILIKE '%peinture%' OR sector ILIKE '%second%' OR sector ILIKE '%isolation%' THEN 'B'
  WHEN sector ILIKE '%plomberie%' OR sector ILIKE '%sanitair%' OR sector ILIKE '%électric%' OR sector ILIKE '%mep%' OR sector ILIKE '%cvc%' OR sector ILIKE '%domotique%' THEN 'C'
  WHEN sector ILIKE '%innovation%' OR sector ILIKE '%numérique%' OR sector ILIKE '%bim%' THEN 'D'
  ELSE 'A'
END
WHERE hall_number IS NULL OR hall_number = '';
