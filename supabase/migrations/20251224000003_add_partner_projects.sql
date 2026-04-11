-- =====================================================
-- MIGRATION: Add Partner Projects Table and Seed Data
-- =====================================================

-- 1. Create partner_projects table
CREATE TABLE IF NOT EXISTS partner_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'planned')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget TEXT,
  impact TEXT,
  image_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  team TEXT[] DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  project_partners TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  gallery TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE partner_projects ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public can view partner projects" ON partner_projects;
CREATE POLICY "Public can view partner projects" ON partner_projects FOR SELECT TO public USING (true);

-- 4. Seed Data for Partners
-- We use the IDs from 20251224000002_seed_demo_data.sql

-- Clear existing projects to avoid duplicates during re-runs
DELETE FROM partner_projects;

INSERT INTO partner_projects (partner_id, name, description, status, start_date, end_date, budget, impact, image_url, technologies, team, kpis, timeline, project_partners, documents, gallery)
VALUES
  -- Projects for Platinium Global Corp (00000000-0000-0000-0000-000000000107)
  (
    '00000000-0000-0000-0000-000000000107',
    'Smart Port Hub 2030',
    'Développement d''une plateforme intégrée de gestion portuaire utilisant la 5G et l''IA pour l''automatisation des terminaux.',
    'active',
    '2024-01-01',
    '2026-12-31',
    '15.5M €',
    'Augmentation productivité +40%',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    ARRAY['5G', 'IA', 'Edge Computing'],
    ARRAY['Jean-Marc L.', 'Sarah B.', 'Kevin T.'],
    '{"progress": 65, "satisfaction": 95, "roi": 210}',
    '[{"phase": "Infrastructure", "date": "2024-06-01", "status": "completed", "description": "Installation des antennes 5G"}, {"phase": "Software", "date": "2025-01-15", "status": "current", "description": "Déploiement du moteur IA"}]',
    ARRAY['Port de Tanger', 'Telecom Global'],
    '[{"name": "Livre Blanc", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=400']
  ),
  
  -- Projects for Global Shipping Alliance (00000000-0000-0000-0000-000000000105)
  (
    '00000000-0000-0000-0000-000000000105',
    'Eco-Logistics Network',
    'Optimisation des routes de transport pour réduire l''empreinte carbone de la chaîne logistique globale.',
    'completed',
    '2023-05-10',
    '2024-11-20',
    '4.2M €',
    'Réduction CO2 -25%',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
    ARRAY['Big Data', 'Algorithmes Verts'],
    ARRAY['Marc D.', 'Elena S.'],
    '{"progress": 100, "satisfaction": 88, "roi": 145}',
    '[{"phase": "Audit", "date": "2023-06-01", "status": "completed", "description": "Analyse des flux existants"}, {"phase": "Optimisation", "date": "2024-11-20", "status": "completed", "description": "Mise en service du nouveau réseau"}]',
    ARRAY['Green Freight', 'LogiTrack'],
    '[{"name": "Rapport Impact", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400']
  ),

  -- Projects for Port Tech Systems (00000000-0000-0000-0000-000000000109)
  (
    '00000000-0000-0000-0000-000000000109',
    'Blockchain Cargo Tracking',
    'Système de traçabilité immuable pour les marchandises sensibles transitant par les ports internationaux.',
    'active',
    '2024-08-15',
    '2025-12-01',
    '2.8M €',
    'Sécurité accrue 100%',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    ARRAY['Blockchain', 'Hyperledger', 'IoT'],
    ARRAY['Thomas W.', 'Li Na'],
    '{"progress": 45, "satisfaction": 92, "roi": 120}',
    '[{"phase": "MVP", "date": "2024-12-01", "status": "completed", "description": "Test sur le port de Rotterdam"}]',
    ARRAY['IBM Logistics', 'Maersk'],
    '[{"name": "Spécifications", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400']
  ),

  -- Projects for Museum Heritage (00000000-0000-0000-0000-000000000108)
  (
    '00000000-0000-0000-0000-000000000108',
    'Digital Maritime Archive',
    'Numérisation 3D des épaves historiques et création d''un musée virtuel accessible au grand public.',
    'planned',
    '2025-03-01',
    '2027-03-01',
    '1.5M €',
    'Éducation & Culture',
    'https://images.unsplash.com/photo-1501503060445-738213995a8c?w=800&q=80',
    ARRAY['Photogrammétrie', 'VR/AR'],
    ARRAY['Pr. Aris T.', 'Sophie M.'],
    '{"progress": 5, "satisfaction": 100, "roi": 0}',
    '[{"phase": "Scan", "date": "2025-04-01", "status": "upcoming", "description": "Première expédition sous-marine"}]',
    ARRAY['UNESCO', 'DeepSea Research'],
    '[{"name": "Brochure", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400']
  ),

  -- Projects for Silver Tech Group (00000000-0000-0000-0000-000000000106)
  (
    '00000000-0000-0000-0000-000000000106',
    'EventConnect Mobile App',
    'Application mobile de networking en temps réel pour les grands salons internationaux.',
    'completed',
    '2024-01-10',
    '2024-09-30',
    '850k €',
    'Engagement utilisateur +60%',
    'https://images.unsplash.com/photo-1512428559083-a40ce12b26f0?w=800&q=80',
    ARRAY['React Native', 'Node.js', 'WebSockets'],
    ARRAY['Alice R.', 'Bob S.'],
    '{"progress": 100, "satisfaction": 94, "roi": 115}',
    '[{"phase": "Lancement", "date": "2024-09-30", "status": "completed", "description": "Déploiement sur les stores"}]',
    ARRAY['Expo Global'],
    '[{"name": "User Guide", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=400']
  ),

  -- Projects for Ocean Freight Services (00000000-0000-0000-0000-000000000110)
  (
    '00000000-0000-0000-0000-000000000110',
    'Global Route Optimizer',
    'Système d''optimisation des trajets maritimes pour minimiser la consommation de carburant.',
    'active',
    '2024-11-01',
    '2025-12-31',
    '3.5M €',
    'Économie carburant 12%',
    'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80',
    ARRAY['Python', 'Machine Learning', 'Satellite Data'],
    ARRAY['Capt. Nemo', 'Dr. Aronnax'],
    '{"progress": 30, "satisfaction": 85, "roi": 160}',
    '[{"phase": "Data Collection", "date": "2025-01-01", "status": "current", "description": "Intégration des données météo"}]',
    ARRAY['WeatherGlobal'],
    '[{"name": "Technical Specs", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400']
  );
