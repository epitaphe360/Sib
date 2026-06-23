-- ================================================================
-- Étend l'enum exhibitor_category avec les catégories BTP du SIB.
-- L'enum d'origine était portuaire (héritage du projet précédent).
--
-- ⚠️  À appliquer en PREMIER, avant seed-demo.sql
-- ================================================================
ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'construction';
ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'materials';
ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'equipment';
ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'services';
ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'decoration';
