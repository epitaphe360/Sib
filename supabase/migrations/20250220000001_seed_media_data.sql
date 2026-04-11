-- Seed Data pour les Fonctionnalités Médias
-- Exemples de données pour tester les fonctionnalités

BEGIN;

-- ============================================================================
-- SEED: WEBINAIRES
-- ============================================================================

-- Webinaire 1: Innovation Portuaire 2025
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Innovation Portuaire 2025 : Les Technologies qui Transforment le Secteur',
  'Découvrez les dernières innovations technologiques qui révolutionnent l''industrie portuaire. Des experts internationaux partagent leurs insights sur l''automatisation, l''IoT et l''intelligence artificielle dans les ports modernes.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3600,
  '[
    {"name": "Dr. Marie Laurent", "title": "Directrice Innovation", "company": "Port du Havre", "photo_url": "https://randomuser.me/api/portraits/women/1.jpg"},
    {"name": "Jean Dupont", "title": "CTO", "company": "Maritime Tech Solutions", "photo_url": "https://randomuser.me/api/portraits/men/1.jpg"}
  ]'::jsonb,
  ARRAY['innovation', 'technologie', 'port', 'automatisation'],
  'Technologie',
  'published',
  NOW() - INTERVAL '7 days'
);

-- Webinaire 2: Logistique Verte
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Logistique Verte : Vers des Ports Durables et Éco-Responsables',
  'Comment les ports s''adaptent aux enjeux environnementaux. Stratégies de décarbonation, énergies renouvelables et certifications écologiques.',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2700,
  '[
    {"name": "Sophie Martin", "title": "Responsable Développement Durable", "company": "Port de Marseille", "photo_url": "https://randomuser.me/api/portraits/women/2.jpg"},
    {"name": "Pierre Legrand", "title": "Consultant Environnemental", "company": "EcoPort Consulting", "photo_url": "https://randomuser.me/api/portraits/men/2.jpg"}
  ]'::jsonb,
  ARRAY['développement durable', 'écologie', 'port vert'],
  'Environnement',
  'published',
  NOW() - INTERVAL '14 days'
);

-- Webinaire 3: Cybersécurité Portuaire
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Cybersécurité dans les Ports : Protéger les Infrastructures Critiques',
  'Analyse des menaces cybernétiques dans le secteur portuaire et les meilleures pratiques pour sécuriser vos opérations. Conformité RGPD et normes ISO 27001.',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3300,
  '[
    {"name": "Marc Dubois", "title": "Expert Cybersécurité", "company": "SecurePort Systems", "photo_url": "https://randomuser.me/api/portraits/men/6.jpg"},
    {"name": "Nadia El Fassi", "title": "CISO", "company": "Port Tanger Med", "photo_url": "https://randomuser.me/api/portraits/women/6.jpg"}
  ]'::jsonb,
  ARRAY['cybersécurité', 'sécurité', 'technologie', 'rgpd'],
  'Technologie',
  'published',
  NOW() - INTERVAL '21 days'
);

-- Webinaire 4: Blockchain et Traçabilité
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Blockchain et Supply Chain : Révolutionner la Traçabilité Maritime',
  'Découvrez comment la technologie blockchain transforme la logistique maritime. Cas d''usage concrets, smart contracts et interopérabilité des systèmes.',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2850,
  '[
    {"name": "Thomas Chen", "title": "Blockchain Architect", "company": "MarineChain", "photo_url": "https://randomuser.me/api/portraits/men/7.jpg"},
    {"name": "Lisa Anderson", "title": "VP Operations", "company": "TrackShip Global", "photo_url": "https://randomuser.me/api/portraits/women/7.jpg"}
  ]'::jsonb,
  ARRAY['blockchain', 'innovation', 'traçabilité', 'supply chain'],
  'Innovation',
  'published',
  NOW() - INTERVAL '28 days'
);

-- Webinaire 5: Ressources Humaines Portuaires
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Attractivité et Rétention des Talents dans le Secteur Portuaire',
  'Stratégies RH innovantes pour attirer et fidéliser les jeunes talents. Formation continue, transformation digitale des métiers et marque employeur.',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  2400,
  '[
    {"name": "Isabelle Moreau", "title": "DRH", "company": "Port Autonome d''Abidjan", "photo_url": "https://randomuser.me/api/portraits/women/8.jpg"},
    {"name": "Karim Benali", "title": "Consultant RH", "company": "TalentPort Advisory", "photo_url": "https://randomuser.me/api/portraits/men/8.jpg"}
  ]'::jsonb,
  ARRAY['rh', 'talents', 'formation', 'management'],
  'Business',
  'published',
  NOW() - INTERVAL '35 days'
);

-- Webinaire 6: Intelligence Artificielle
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'IA et Machine Learning : Optimiser les Opérations Portuaires',
  'Applications concrètes de l''intelligence artificielle dans la gestion portuaire : prédiction de trafic, maintenance prédictive et automatisation intelligente.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  3150,
  '[
    {"name": "Dr. Yuki Tanaka", "title": "AI Research Lead", "company": "SmartPort Labs", "photo_url": "https://randomuser.me/api/portraits/men/9.jpg"},
    {"name": "Elena Rodriguez", "title": "Data Scientist", "company": "Port de Barcelona", "photo_url": "https://randomuser.me/api/portraits/women/9.jpg"}
  ]'::jsonb,
  ARRAY['ia', 'machine learning', 'automatisation', 'data'],
  'Technologie',
  'published',
  NOW() - INTERVAL '42 days'
);

-- Webinaire 7: Financement et Investissement
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Financer la Modernisation des Ports : Stratégies et Opportunités',
  'Sources de financement pour les projets d''infrastructures portuaires. PPP, investissements verts et fonds internationaux disponibles.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  2550,
  '[
    {"name": "Philippe Girard", "title": "Directeur Financier", "company": "AfricaPort Investment", "photo_url": "https://randomuser.me/api/portraits/men/10.jpg"},
    {"name": "Fatima Zahra", "title": "Analyste Financier", "company": "World Bank Maritime Division", "photo_url": "https://randomuser.me/api/portraits/women/10.jpg"}
  ]'::jsonb,
  ARRAY['finance', 'investissement', 'infrastructure', 'ppp'],
  'Business',
  'published',
  NOW() - INTERVAL '49 days'
);

-- Webinaire 8: Réglementation Maritime
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Nouvelles Réglementations Maritimes 2025 : Impacts et Conformité',
  'Tour d''horizon des nouvelles normes IMO, réglementations environnementales et obligations douanières. Comment s''adapter efficacement.',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2950,
  '[
    {"name": "Maître Dupont", "title": "Avocat Maritime", "company": "Dupont & Associés", "photo_url": "https://randomuser.me/api/portraits/men/11.jpg"},
    {"name": "Catherine Blanc", "title": "Compliance Officer", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/women/11.jpg"}
  ]'::jsonb,
  ARRAY['réglementation', 'conformité', 'maritime', 'imo'],
  'Réglementation',
  'published',
  NOW() - INTERVAL '56 days'
);

-- Webinaire 9: Ports Intelligents
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Smart Ports : IoT, 5G et Connectivité au Service de l''Efficacité',
  'Technologies de communication 5G, capteurs IoT et plateformes de gestion intégrées pour créer le port du futur.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3450,
  '[
    {"name": "Omar Bensaid", "title": "CTO", "company": "Port de Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/12.jpg"},
    {"name": "Julie Kim", "title": "IoT Solutions Architect", "company": "Huawei Marine", "photo_url": "https://randomuser.me/api/portraits/women/12.jpg"}
  ]'::jsonb,
  ARRAY['smart port', 'iot', '5g', 'connectivité'],
  'Technologie',
  'published',
  NOW() - INTERVAL '63 days'
);

-- Webinaire 10: Économie Circulaire
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Économie Circulaire dans les Zones Portuaires : De la Théorie à la Pratique',
  'Recyclage des matériaux, réutilisation des ressources et symbiose industrielle dans les écosystèmes portuaires.',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2650,
  '[
    {"name": "Aminata Diop", "title": "Directrice Environnement", "company": "Port Autonome de Lomé", "photo_url": "https://randomuser.me/api/portraits/women/13.jpg"},
    {"name": "Jean-Marc Dubois", "title": "Expert Économie Circulaire", "company": "Circular Ports Initiative", "photo_url": "https://randomuser.me/api/portraits/men/13.jpg"}
  ]'::jsonb,
  ARRAY['économie circulaire', 'recyclage', 'durabilité', 'environnement'],
  'Environnement',
  'published',
  NOW() - INTERVAL '70 days'
);

-- ============================================================================
-- SEED: PODCASTS
-- ============================================================================

-- Podcast Episode 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIPORT Talks #1 - L''Avenir de la Logistique Maritime avec Ahmed Hassan',
  'Dans ce premier épisode, nous recevons Ahmed Hassan, CEO de Maritime Logistics International. Il nous parle de sa vision pour l''avenir du transport maritime et des défis à venir.',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  2400,
  '[
    {"name": "Ahmed Hassan", "title": "CEO", "company": "Maritime Logistics International", "photo_url": "https://randomuser.me/api/portraits/men/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'logistique', 'maritime', 'leadership'],
  'Business',
  'published',
  NOW() - INTERVAL '5 days'
);

-- Podcast Episode 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIPORT Talks #2 - Innovation et Digitalisation avec Clara Dubois',
  'Clara Dubois, Directrice de l''Innovation chez PortTech, partage son parcours et les projets innovants qui transforment les opérations portuaires.',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  1800,
  '[
    {"name": "Clara Dubois", "title": "Directrice Innovation", "company": "PortTech", "photo_url": "https://randomuser.me/api/portraits/women/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'innovation', 'digital', 'technologie'],
  'Innovation',
  'published',
  NOW() - INTERVAL '12 days'
);

-- Podcast Episode 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #3 - L''Essor des Ports Africains avec Amadou Koné',
  'Amadou Koné, Directeur du Port d''Abidjan, nous parle du développement spectaculaire des infrastructures portuaires en Afrique de l''Ouest et des opportunités à saisir.',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  2100,
  '[
    {"name": "Amadou Koné", "title": "Directeur Général", "company": "Port Autonome d''Abidjan", "photo_url": "https://randomuser.me/api/portraits/men/14.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'afrique', 'développement', 'infrastructure'],
  'Business',
  'published',
  NOW() - INTERVAL '19 days'
);

-- Podcast Episode 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #4 - Transition Énergétique avec Marina Silva',
  'Marina Silva, experte en énergies marines renouvelables, explore les solutions pour décarboner le secteur maritime et portuaire.',
  'https://images.unsplash.com/photo-1497864149936-d3163f0c0f4b?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  1950,
  '[
    {"name": "Marina Silva", "title": "Consultante Énergie", "company": "BlueEnergy Solutions", "photo_url": "https://randomuser.me/api/portraits/women/14.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'énergie', 'transition', 'environnement'],
  'Environnement',
  'published',
  NOW() - INTERVAL '26 days'
);

-- Podcast Episode 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #5 - Automatisation et Robotique avec Dr. Hans Schmidt',
  'Le Dr. Hans Schmidt, pionnier de la robotique portuaire, partage sa vision sur l''automatisation des terminaux et l''impact sur l''emploi.',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  2250,
  '[
    {"name": "Dr. Hans Schmidt", "title": "Chief Robotics Officer", "company": "AutoPort Technologies", "photo_url": "https://randomuser.me/api/portraits/men/15.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'automatisation', 'robotique', 'technologie'],
  'Technologie',
  'published',
  NOW() - INTERVAL '33 days'
);

-- Podcast Episode 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #6 - Femmes Leaders dans le Maritime avec Samira Alaoui',
  'Samira Alaoui, première femme Capitaine de Port au Maroc, raconte son parcours inspirant et encourage plus de diversité dans le secteur.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  1850,
  '[
    {"name": "Samira Alaoui", "title": "Capitaine de Port", "company": "Port de Tanger", "photo_url": "https://randomuser.me/api/portraits/women/15.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'leadership', 'diversité', 'inspiration'],
  'Leadership',
  'published',
  NOW() - INTERVAL '40 days'
);

-- Podcast Episode 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #7 - Économie Bleue et Opportunités avec Jean-Paul Océan',
  'Jean-Paul Océan, économiste spécialisé dans l''économie maritime, analyse les tendances du marché et les opportunités de croissance.',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  2150,
  '[
    {"name": "Jean-Paul Océan", "title": "Économiste Maritime", "company": "BlueEconomy Institute", "photo_url": "https://randomuser.me/api/portraits/men/16.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'économie', 'maritime', 'business'],
  'Business',
  'published',
  NOW() - INTERVAL '47 days'
);

-- Podcast Episode 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #8 - Formation et Compétences avec Patricia N''Dour',
  'Patricia N''Dour, Directrice de l''Institut Maritime de Dakar, présente les nouvelles formations pour préparer les professionnels de demain.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  1750,
  '[
    {"name": "Patricia N''Dour", "title": "Directrice", "company": "Institut Maritime de Dakar", "photo_url": "https://randomuser.me/api/portraits/women/16.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'formation', 'éducation', 'compétences'],
  'Éducation',
  'published',
  NOW() - INTERVAL '54 days'
);

-- Podcast Episode 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #9 - Partenariats Public-Privé avec Alexandre Fontaine',
  'Alexandre Fontaine, expert en PPP, explique comment structurer des partenariats gagnants pour financer les grands projets portuaires.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  2050,
  '[
    {"name": "Alexandre Fontaine", "title": "Consultant PPP", "company": "Infrastructure Partners", "photo_url": "https://randomuser.me/api/portraits/men/17.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'ppp', 'financement', 'partenariat'],
  'Business',
  'published',
  NOW() - INTERVAL '61 days'
);

-- Podcast Episode 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIPORT Talks #10 - Digitalisation des Douanes avec Fatou Diagne',
  'Fatou Diagne, Directrice des Douanes Sénégalaises, partage l''expérience réussie de digitalisation du Port de Dakar.',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  1900,
  '[
    {"name": "Fatou Diagne", "title": "Directrice des Douanes", "company": "Gouvernement du Sénégal", "photo_url": "https://randomuser.me/api/portraits/women/17.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'douanes', 'digitalisation', 'efficiency'],
  'Innovation',
  'published',
  NOW() - INTERVAL '68 days'
);

-- ============================================================================
-- SEED: CAPSULES "INSIDE SIPORT"
-- ============================================================================

-- Capsule 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Découverte du Pavillon Innovation',
  'Plongez au cœur du Pavillon Innovation de SIPORT 2026. Découvrez les exposants et leurs solutions révolutionnaires.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  180,
  ARRAY['siport', 'pavillon', 'innovation', 'découverte'],
  'Événement',
  'published',
  NOW() - INTERVAL '3 days'
);

-- Capsule 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Les Coulisses de l''Organisation',
  'Rencontrez l''équipe qui organise SIPORT et découvrez les coulisses de cet événement d''envergure internationale.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  240,
  ARRAY['siport', 'organisation', 'équipe', 'coulisses'],
  'Événement',
  'published',
  NOW() - INTERVAL '10 days'
);

-- Capsule 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Interview Express : Les Startups de la Maritime Tech',
  'Micro-interviews des jeunes pousses innovantes qui bousculent le secteur maritime. 3 minutes pour convaincre !',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  195,
  ARRAY['startups', 'innovation', 'maritime tech', 'pitch'],
  'Innovation',
  'published',
  NOW() - INTERVAL '17 days'
);

-- Capsule 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Visite Guidée du Stand Maersk',
  'Découvrez en exclusivité les innovations présentées par Maersk sur leur stand SIPORT 2025.',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  220,
  ARRAY['maersk', 'exposant', 'visite', 'innovation'],
  'Partenaires',
  'published',
  NOW() - INTERVAL '24 days'
);

-- Capsule 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Le Making-Of du Salon',
  'De la conception à l''inauguration : le making-of complet de SIPORT. Montage, logistique et premières impressions.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  280,
  ARRAY['making-of', 'organisation', 'logistique', 'behind'],
  'Événement',
  'published',
  NOW() - INTERVAL '31 days'
);

-- Capsule 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Zone Networking : Quand les Deals se Font',
  'Ambiance survoltée dans la zone networking. Rencontres, échanges de cartes et deals en direct.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  150,
  ARRAY['networking', 'business', 'rencontres', 'deals'],
  'Business',
  'published',
  NOW() - INTERVAL '38 days'
);

-- Capsule 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Les Démonstrations Technologiques',
  'Tour rapide des démonstrations tech les plus impressionnantes : drones, robots, réalité virtuelle et plus encore.',
  'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  210,
  ARRAY['demo', 'technologie', 'innovation', 'robots'],
  'Technologie',
  'published',
  NOW() - INTERVAL '45 days'
);

-- Capsule 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Focus sur les Partenaires Gold',
  'Rencontre avec nos partenaires Gold et découverte de leurs contributions exceptionnelles à l''événement.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  265,
  ARRAY['partenaires', 'gold', 'sponsors', 'collaboration'],
  'Partenaires',
  'published',
  NOW() - INTERVAL '52 days'
);

-- Capsule 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - La Conférence Inaugurale en 3 Minutes',
  'Revivez les moments clés de la conférence inaugurale de SIPORT 2025 avec les discours des personnalités.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  185,
  ARRAY['inauguration', 'conférence', 'discours', 'officiel'],
  'Événement',
  'published',
  NOW() - INTERVAL '59 days'
);

-- Capsule 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Les Workshops Pratiques',
  'Immersion dans les ateliers pratiques : formations, sessions hands-on et partage d''expériences entre professionnels.',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  245,
  ARRAY['workshops', 'formation', 'pratique', 'hands-on'],
  'Éducation',
  'published',
  NOW() - INTERVAL '66 days'
);

-- ============================================================================
-- SEED: LIVE STUDIO "MEET THE LEADERS"
-- ============================================================================

-- Interview Live Studio 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Interview avec François Mercier, PDG de SeaConnect',
  'Une discussion exclusive avec François Mercier sur l''avenir du secteur maritime et les opportunités de croissance en Afrique.',
  'https://images.unsplash.com/photo-1560438718-eb61ede255eb?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1200,
  '[
    {"name": "François Mercier", "title": "PDG", "company": "SeaConnect", "photo_url": "https://randomuser.me/api/portraits/men/4.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'maritime', 'afrique'],
  'Leadership',
  'published',
  NOW() - INTERVAL '2 days'
);

-- Interview Live Studio 2
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Entretien avec Aïcha Diallo, CEO de AfroPort Logistics',
  'Aïcha Diallo partage sa vision inspirante du développement de la logistique portuaire en Afrique francophone.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1350,
  '[
    {"name": "Aïcha Diallo", "title": "CEO", "company": "AfroPort Logistics", "photo_url": "https://randomuser.me/api/portraits/women/18.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'afrique', 'logistique'],
  'Leadership',
  'published',
  NOW() - INTERVAL '9 days'
);

-- Interview Live Studio 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Discussion avec Carlos Rodriguez, Président CMA CGM Afrique',
  'Carlos Rodriguez évoque les stratégies de CMA CGM sur le continent africain et les investissements à venir.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1450,
  '[
    {"name": "Carlos Rodriguez", "title": "Président Afrique", "company": "CMA CGM", "photo_url": "https://randomuser.me/api/portraits/men/18.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'shipping', 'investissement', 'stratégie'],
  'Business',
  'published',
  NOW() - INTERVAL '16 days'
);

-- Interview Live Studio 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Face-à-face avec Dr. Kwame Asante, Ministre des Transports du Ghana',
  'Le Ministre ghanéen des Transports présente les réformes portuaires et la vision 2030 pour Tema et Takoradi.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1550,
  '[
    {"name": "Dr. Kwame Asante", "title": "Ministre des Transports", "company": "Gouvernement du Ghana", "photo_url": "https://randomuser.me/api/portraits/men/19.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'politique', 'ghana', 'réforme'],
  'Politique',
  'published',
  NOW() - INTERVAL '23 days'
);

-- Interview Live Studio 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Rencontre avec Léa Fontaine, DG de DP World Dakar',
  'Léa Fontaine, première femme à diriger un terminal DP World en Afrique, raconte son parcours et ses ambitions.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1280,
  '[
    {"name": "Léa Fontaine", "title": "Directrice Générale", "company": "DP World Dakar", "photo_url": "https://randomuser.me/api/portraits/women/19.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'femme', 'terminal'],
  'Leadership',
  'published',
  NOW() - INTERVAL '30 days'
);

-- Interview Live Studio 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Dialogue avec Omar Benali, PDG d''APM Terminals Casablanca',
  'Omar Benali détaille les projets d''expansion du terminal de Casablanca et l''impact sur l''économie marocaine.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1380,
  '[
    {"name": "Omar Benali", "title": "PDG", "company": "APM Terminals Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/20.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'terminal', 'maroc', 'expansion'],
  'Business',
  'published',
  NOW() - INTERVAL '37 days'
);

-- Interview Live Studio 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Conversation avec Sarah Johnson, VP Innovation chez Bolloré Logistics',
  'Sarah Johnson présente les innovations technologiques de Bolloré Logistics pour optimiser la chaîne logistique africaine.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1320,
  '[
    {"name": "Sarah Johnson", "title": "VP Innovation", "company": "Bolloré Logistics", "photo_url": "https://randomuser.me/api/portraits/women/20.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'innovation', 'logistique', 'technologie'],
  'Innovation',
  'published',
  NOW() - INTERVAL '44 days'
);

-- Interview Live Studio 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Tête-à-tête avec Jean-Marc Dubois, Directeur Afrique MSC',
  'Jean-Marc Dubois révèle les ambitions de MSC sur le continent et les nouvelles lignes maritimes prévues.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1420,
  '[
    {"name": "Jean-Marc Dubois", "title": "Directeur Afrique", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/men/21.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'shipping', 'msc', 'expansion'],
  'Business',
  'published',
  NOW() - INTERVAL '51 days'
);

-- Interview Live Studio 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Échange avec Aminata Touré, Présidente de l''APAC',
  'Aminata Touré, Présidente de l''Association des Ports d''Afrique Centrale, expose les enjeux de coopération régionale.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1250,
  '[
    {"name": "Aminata Touré", "title": "Présidente APAC", "company": "Association Ports Afrique Centrale", "photo_url": "https://randomuser.me/api/portraits/women/21.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'association', 'coopération', 'région'],
  'Politique',
  'published',
  NOW() - INTERVAL '58 days'
);

-- Interview Live Studio 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Interview avec Patrick O''Brien, CEO de Hutchison Ports',
  'Patrick O''Brien dévoile les plans d''investissement d''Hutchison Ports dans les terminaux africains pour la prochaine décennie.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1480,
  '[
    {"name": "Patrick O''Brien", "title": "CEO", "company": "Hutchison Ports", "photo_url": "https://randomuser.me/api/portraits/men/22.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'investissement', 'terminal', 'stratégie'],
  'Business',
  'published',
  NOW() - INTERVAL '65 days'
);

-- ============================================================================
-- SEED: BEST MOMENTS
-- ============================================================================

-- Best Moments 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Meilleurs Moments Jour 1',
  'Revivez les temps forts de la première journée de SIPORT 2025 : inaugurations, rencontres et moments marquants.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  300,
  ARRAY['siport', 'highlights', 'événement', 'résumé'],
  'Événement',
  'published',
  NOW() - INTERVAL '30 days'
);

-- Best Moments 2
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Jour 2 : Moments d''Exception',
  'Compilé des meilleurs moments du deuxième jour : conférences plénières, débats animés et networking intensif.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  285,
  ARRAY['siport', 'jour2', 'highlights', 'conférences'],
  'Événement',
  'published',
  NOW() - INTERVAL '29 days'
);

-- Best Moments 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Gala de Clôture : Les Instants Mémorables',
  'Le gala de clôture en images : remise des awards, discours émouvants et célébration collective.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  320,
  ARRAY['gala', 'clôture', 'awards', 'célébration'],
  'Événement',
  'published',
  NOW() - INTERVAL '28 days'
);

-- Best Moments 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2024 - Rétrospective de l''Édition Précédente',
  'Les moments forts de SIPORT 2024 : innovation, rencontres et succès partagés.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  380,
  ARRAY['siport 2024', 'rétrospective', 'archives', 'histoire'],
  'Événement',
  'published',
  NOW() - INTERVAL '395 days'
);

-- Best Moments 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Annonces Majeures',
  'Compilation des annonces les plus importantes : nouveaux partenariats, innovations et projets révolutionnaires.',
  'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  275,
  ARRAY['annonces', 'partenariats', 'innovation', 'révélations'],
  'Business',
  'published',
  NOW() - INTERVAL '27 days'
);

-- Best Moments 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Démonstrations qui Ont Marqué les Esprits',
  'Retour sur les démonstrations technologiques spectaculaires qui ont impressionné les visiteurs.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  295,
  ARRAY['démonstrations', 'technologie', 'innovation', 'spectacle'],
  'Technologie',
  'published',
  NOW() - INTERVAL '26 days'
);

-- Best Moments 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Networking : Les Rencontres qui Comptent',
  'Immersion dans l''espace networking avec les échanges les plus prometteurs et les connexions établies.',
  'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  240,
  ARRAY['networking', 'rencontres', 'business', 'connexions'],
  'Business',
  'published',
  NOW() - INTERVAL '25 days'
);

-- Best Moments 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Témoignages Spontanés',
  'Réactions à chaud des participants, exposants et visiteurs : émotions, surprises et satisfactions.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  265,
  ARRAY['témoignages', 'réactions', 'émotions', 'spontané'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '24 days'
);

-- Best Moments 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Coulisses du Succès',
  'Dans les coulisses de SIPORT : l''équipe à l''œuvre, les préparatifs et la coordination parfaite.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  310,
  ARRAY['coulisses', 'équipe', 'organisation', 'préparatifs'],
  'Événement',
  'published',
  NOW() - INTERVAL '23 days'
);

-- Best Moments 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Le Meilleur du Meilleur : Édition Collector',
  'Compilation ultime des moments les plus extraordinaires de SIPORT 2025. Une édition à ne pas manquer !',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  420,
  ARRAY['compilation', 'best of', 'collector', 'exceptionnel'],
  'Événement',
  'published',
  NOW() - INTERVAL '22 days'
);

-- ============================================================================
-- SEED: TESTIMONIALS
-- ============================================================================

-- Testimonial 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - Port Autonome de Dakar',
  'Découvrez l''expérience du Port Autonome de Dakar en tant que partenaire Gold de SIPORT et les bénéfices de cette collaboration.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  120,
  '[
    {"name": "Mamadou Diallo", "title": "Directeur Général", "company": "Port Autonome de Dakar", "photo_url": "https://randomuser.me/api/portraits/men/5.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'dakar', 'port'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '15 days'
);

-- Testimonial 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - TechMarine Solutions',
  'TechMarine Solutions partage son retour d''expérience après 2 ans de partenariat avec SIPORT et les résultats obtenus.',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  90,
  '[
    {"name": "Sarah Johnson", "title": "VP Marketing", "company": "TechMarine Solutions", "photo_url": "https://randomuser.me/api/portraits/women/4.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'technologie', 'résultats'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '20 days'
);

-- Testimonial 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Bollore Logistics : Un Partenariat Fructueux',
  'Le Directeur Régional de Bollore Logistics témoigne de l''impact positif de sa participation à SIPORT sur son activité.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  135,
  '[
    {"name": "Laurent Petit", "title": "Directeur Régional", "company": "Bollore Logistics", "photo_url": "https://randomuser.me/api/portraits/men/23.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'logistique', 'impact'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '18 days'
);

-- Testimonial 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Port de Lomé : Une Collaboration Stratégique',
  'Le Port de Lomé explique comment SIPORT a facilité des partenariats stratégiques et accéléré sa modernisation.',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  105,
  '[
    {"name": "Koffi Mensah", "title": "Directeur Commercial", "company": "Port Autonome de Lomé", "photo_url": "https://randomuser.me/api/portraits/men/24.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'port', 'togo', 'partenariat'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '25 days'
);

-- Testimonial 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Startup MarineAI : Le Tremplin SIPORT',
  'La startup MarineAI raconte comment SIPORT lui a permis de rencontrer ses premiers clients majeurs.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  95,
  '[
    {"name": "Thomas Girard", "title": "Co-fondateur", "company": "MarineAI", "photo_url": "https://randomuser.me/api/portraits/men/25.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'startup', 'success story', 'innovation'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '32 days'
);

-- Testimonial 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - CMA CGM : Exposition à Forte Valeur Ajoutée',
  'CMA CGM souligne la qualité exceptionnelle des visiteurs et contacts générés lors de SIPORT.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  110,
  '[
    {"name": "Philippe Bernard", "title": "Responsable Expositions", "company": "CMA CGM", "photo_url": "https://randomuser.me/api/portraits/men/26.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'exposant', 'shipping', 'networking'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '39 days'
);

-- Testimonial 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Port de Cotonou : Visibilité Internationale',
  'Le Port de Cotonou témoigne de la visibilité internationale obtenue grâce à sa participation à SIPORT.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  125,
  '[
    {"name": "Rachelle Akpo", "title": "Chef Marketing", "company": "Port Autonome de Cotonou", "photo_url": "https://randomuser.me/api/portraits/women/22.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'port', 'bénin', 'visibilité'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '46 days'
);

-- Testimonial 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Jeune Diplômé : Opportunités de Carrière',
  'Un jeune diplômé raconte comment SIPORT lui a permis de décrocher son premier emploi dans le secteur portuaire.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  85,
  '[
    {"name": "Youssef Benali", "title": "Ingénieur Junior", "company": "Port de Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/27.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'carrière', 'emploi', 'jeune'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '53 days'
);

-- Testimonial 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - MSC : Plateforme d''Excellence',
  'MSC confirme SIPORT comme LA plateforme incontournable pour le business maritime en Afrique.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  115,
  '[
    {"name": "Antonio Rossi", "title": "Regional Manager", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/men/28.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'msc', 'shipping', 'plateforme'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '60 days'
);

-- Testimonial 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Consultant Indépendant : Réseau Élargi',
  'Un consultant indépendant explique comment SIPORT a triplé son réseau professionnel en seulement 3 jours.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  100,
  '[
    {"name": "Isabelle Fournier", "title": "Consultante Indépendante", "company": "Maritime Consulting Group", "photo_url": "https://randomuser.me/api/portraits/women/23.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'consultant', 'réseau', 'networking'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '67 days'
);

-- Testimonial 11
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - APM Terminals : ROI Exceptionnel',
  'APM Terminals quantifie le retour sur investissement de sa participation : 15 nouveaux contrats signés.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  130,
  '[
    {"name": "Henrik Nielsen", "title": "VP Business Development", "company": "APM Terminals", "photo_url": "https://randomuser.me/api/portraits/men/29.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'apm', 'roi', 'succès'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '74 days'
);

-- ============================================================================
-- SEED: ÉVÉNEMENTS LIVE (À VENIR)
-- ============================================================================

-- Prochain Live Event
-- Utilisation de WITH pour capturer l'ID
WITH new_media AS (
  INSERT INTO media_contents (
    type, 
    title, 
    description, 
    thumbnail_url, 
    duration, 
    speakers, 
    tags, 
    category,
    status
  ) VALUES (
    'live_studio',
    'Live Q&A - L''Avenir de l''Énergie dans les Ports avec Emma Rousseau',
    'Session questions-réponses en direct avec Emma Rousseau, experte en énergies renouvelables pour les infrastructures portuaires.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    3600,
    '[
      {"name": "Emma Rousseau", "title": "Consultante Énergie", "company": "GreenPort Energy", "photo_url": "https://randomuser.me/api/portraits/women/5.jpg"}
    ]'::jsonb,
    ARRAY['live', 'énergie', 'port', 'renouvelable'],
    'Environnement',
    'draft'
  ) RETURNING id
)
-- Créer l'événement live correspondant
INSERT INTO live_events (
  media_content_id,
  event_date,
  duration_minutes,
  live_stream_url,
  chat_enabled,
  registration_required,
  max_participants,
  status
) 
SELECT 
  id,
  NOW() + INTERVAL '7 days',
  60,
  'https://stream.example.com/live/event-123',
  true,
  false,
  1000,
  'scheduled'
FROM new_media;

-- ============================================================================
-- SEED: INTERACTIONS (Exemples)
-- ============================================================================

-- Note: Remplacer les UUIDs par de vrais IDs d'utilisateurs et de médias
-- Exemple d'interaction "view"
-- INSERT INTO media_interactions (user_id, media_content_id, action, watch_time, completed)
-- VALUES ('<user_uuid>', '<media_uuid>', 'view', 1800, true);

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Pour voir tous les webinaires :
-- SELECT * FROM media_contents WHERE type = 'webinar' AND status = 'published';

-- Pour voir les prochains lives :
-- SELECT le.*, mc.title 
-- FROM live_events le
-- JOIN media_contents mc ON le.media_content_id = mc.id
-- WHERE le.event_date > NOW() AND le.status = 'scheduled';

-- Pour obtenir les statistiques d'un média :
-- SELECT 
--   mc.*,
--   COUNT(DISTINCT mi.user_id) FILTER (WHERE mi.action = 'view') as unique_viewers,
--   AVG(mi.watch_time) as avg_watch_time
-- FROM media_contents mc
-- LEFT JOIN media_interactions mi ON mc.id = mi.media_content_id
-- WHERE mc.id = '<media_uuid>'
-- GROUP BY mc.id;
