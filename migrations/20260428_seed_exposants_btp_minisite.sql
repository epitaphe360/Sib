-- =====================================================================
-- SEED : 3 Exposants BTP + Mini-Sites complets (toutes sections)
-- Date       : 2026-04-28
-- Exposants  : ACOFAL · Afrique Étanchéité · Aifeiling Sanitary Wares
-- Secteurs   : Matériaux & Finitions · Sanitaire & Plomberie
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────
-- 0. DÉSACTIVER LES TRIGGERS (seeds admin : auth.uid() = NULL)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.exhibitors DISABLE TRIGGER USER;

-- ─────────────────────────────────────────────────────────────────────
-- 0b. DÉDUPLIQUER — supprimer les doublons (UUIDs aléatoires existants)
--     On garde uniquement les IDs fixes définis ci-dessous.
--     Les mini-sites associés sont supprimés en CASCADE.
-- ─────────────────────────────────────────────────────────────────────
DELETE FROM public.mini_sites
WHERE exhibitor_id IN (
  SELECT id FROM public.exhibitors
  WHERE company_name IN ('ACOFAL', 'Afrique Étanchéité', 'Aifeiling Sanitary Wares Technology Group Co.,Ltd.')
    AND id NOT IN (
      '00000000-0000-0000-0000-000000000130'::uuid,
      '00000000-0000-0000-0000-000000000131'::uuid,
      '00000000-0000-0000-0000-000000000132'::uuid
    )
);

DELETE FROM public.exhibitors
WHERE company_name IN ('ACOFAL', 'Afrique Étanchéité', 'Aifeiling Sanitary Wares Technology Group Co.,Ltd.')
  AND id NOT IN (
    '00000000-0000-0000-0000-000000000130'::uuid,
    '00000000-0000-0000-0000-000000000131'::uuid,
    '00000000-0000-0000-0000-000000000132'::uuid
  );

-- Supprimer aussi les users publics en doublon
DELETE FROM public.users
WHERE name IN ('ACOFAL', 'Afrique Étanchéité', 'Aifeiling Sanitary Wares Technology Group Co.,Ltd.')
  AND id NOT IN (
    '00000000-0000-0000-0000-000000000030'::uuid,
    '00000000-0000-0000-0000-000000000031'::uuid,
    '00000000-0000-0000-0000-000000000032'::uuid
  )
  AND type = 'exhibitor';

-- ─────────────────────────────────────────────────────────────────────
-- IDs fixes
--   ACOFAL              user=...0030  exhibitor=...0130  minisite=...0230
--   Afrique Étanchéité  user=...0031  exhibitor=...0131  minisite=...0231
--   Aifeiling           user=...0032  exhibitor=...0132  minisite=...0232
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- 1. AUTH.USERS
-- ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_pwd text := crypt('Exposant2026!', gen_salt('bf'));
BEGIN
  -- ACOFAL
  DELETE FROM public.users WHERE email = 'acofal@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000030'::uuid;
  DELETE FROM auth.users  WHERE email = 'acofal@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000030'::uuid;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000030'::uuid) THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES ('00000000-0000-0000-0000-000000000030'::uuid, 'acofal@sib2026.ma',
            v_pwd, NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  END IF;

  -- Afrique Étanchéité
  DELETE FROM public.users WHERE email = 'afrique-etancheite@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000031'::uuid;
  DELETE FROM auth.users  WHERE email = 'afrique-etancheite@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000031'::uuid;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000031'::uuid) THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES ('00000000-0000-0000-0000-000000000031'::uuid, 'afrique-etancheite@sib2026.ma',
            v_pwd, NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  END IF;

  -- Aifeiling Sanitary Wares
  DELETE FROM public.users WHERE email = 'aifeiling@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000032'::uuid;
  DELETE FROM auth.users  WHERE email = 'aifeiling@sib2026.ma'
    AND id <> '00000000-0000-0000-0000-000000000032'::uuid;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000032'::uuid) THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES ('00000000-0000-0000-0000-000000000032'::uuid, 'aifeiling@sib2026.ma',
            v_pwd, NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. PUBLIC.USERS
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.users (id, email, name, type, status, profile, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000030',
    'acofal@sib2026.ma',
    'ACOFAL',
    'exhibitor', 'active',
    '{"company": "ACOFAL", "sector": "Matériaux & Finitions", "avatar": "https://ui-avatars.com/api/?name=ACOFAL&background=1e3a5f&color=ffffff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    'afrique-etancheite@sib2026.ma',
    'Afrique Étanchéité',
    'exhibitor', 'active',
    '{"company": "Afrique Étanchéité", "sector": "Matériaux & Finitions", "avatar": "https://ui-avatars.com/api/?name=Afrique+Etancheite&background=B45309&color=ffffff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    'aifeiling@sib2026.ma',
    'Aifeiling Sanitary Wares Technology Group Co.,Ltd.',
    'exhibitor', 'active',
    '{"company": "Aifeiling Sanitary Wares", "sector": "Sanitaire & Plomberie", "avatar": "https://ui-avatars.com/api/?name=Aifeiling&background=0e7490&color=ffffff&size=200"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email   = EXCLUDED.email,
  name    = EXCLUDED.name,
  type    = EXCLUDED.type,
  status  = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- ─────────────────────────────────────────────────────────────────────
-- 3. EXHIBITORS
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.exhibitors
  (id, user_id, company_name, category, sector, description,
   logo_url, website, verified, featured, contact_info, created_at, updated_at)
VALUES

  -- ACOFAL
  (
    '00000000-0000-0000-0000-000000000130'::uuid,
    '00000000-0000-0000-0000-000000000030'::uuid,
    'ACOFAL',
    'port-industry',
    'Matériaux & Finitions',
    'ACOFAL est un exposant du Salon International du Bâtiment SIB 2026, présent dans le secteur des matériaux de construction au Maroc. La société propose une gamme complète de matériaux de finition et de construction adaptés aux exigences des projets résidentiels et tertiaires.',
    'https://ui-avatars.com/api/?name=ACOFAL&background=1e3a5f&color=ffffff&size=200',
    NULL,
    true, true,
    '{"email": "contact@acofal.ma", "phone": "+212 5 22 00 00 00", "address": "Maroc", "city": "Casablanca", "country": "International"}'::jsonb,
    NOW(), NOW()
  ),

  -- Afrique Étanchéité
  (
    '00000000-0000-0000-0000-000000000131'::uuid,
    '00000000-0000-0000-0000-000000000031'::uuid,
    'Afrique Étanchéité',
    'port-industry',
    'Matériaux & Finitions',
    'Afrique Étanchéité est spécialisée dans les solutions d''étanchéité pour le bâtiment. Exposant au Salon International du Bâtiment SIB 2026 à El Jadida. La société intervient sur tous types de surfaces : toitures-terrasses, sous-sols, façades, ponts et ouvrages d''art.',
    'https://ui-avatars.com/api/?name=Afrique+Etancheite&background=B45309&color=ffffff&size=200',
    NULL,
    true, true,
    '{"email": "contact@afrique-etancheite.ma", "phone": "+212 5 22 00 00 01", "address": "El Jadida, Maroc", "city": "El Jadida", "country": "International"}'::jsonb,
    NOW(), NOW()
  ),

  -- Aifeiling Sanitary Wares
  (
    '00000000-0000-0000-0000-000000000132'::uuid,
    '00000000-0000-0000-0000-000000000032'::uuid,
    'Aifeiling Sanitary Wares Technology Group Co.,Ltd.',
    'port-industry',
    'Sanitaire & Plomberie',
    'Aifeiling Sanitary Wares Technology Group Co.,Ltd. est une entreprise leader spécialisée dans les produits de salle de bain, incluant mobilier de salle de bain, baignoires, robinetterie, tuyaux flexibles et systèmes WC intelligents. Fondée en 2002, classée dans le Top 10 des entreprises bain & cuisine en Chine.',
    'https://ui-avatars.com/api/?name=Aifeiling&background=0e7490&color=ffffff&size=200',
    'https://www.aifeiling.com',
    true, true,
    '{"email": "export@aifeiling.com", "phone": "+86 757 8888 0000", "address": "Foshan, Guangdong, Chine", "city": "Foshan", "country": "International"}'::jsonb,
    NOW(), NOW()
  )

ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  category     = EXCLUDED.category,
  sector       = EXCLUDED.sector,
  description  = EXCLUDED.description,
  logo_url     = EXCLUDED.logo_url,
  website      = EXCLUDED.website,
  verified     = EXCLUDED.verified,
  featured     = EXCLUDED.featured,
  contact_info = EXCLUDED.contact_info,
  updated_at   = NOW();

-- ─────────────────────────────────────────────────────────────────────
-- 4. MINI-SITES  (toutes sections peuplées)
-- ─────────────────────────────────────────────────────────────────────

-- ── 4a. ACOFAL ───────────────────────────────────────────────────────
INSERT INTO public.mini_sites
  (id, exhibitor_id, theme, custom_colors, sections, published, views, last_updated, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000230'::uuid,
  '00000000-0000-0000-0000-000000000130'::uuid,
  'modern',
  '{"primary": "#1e3a5f", "secondary": "#2563eb", "accent": "#60a5fa"}'::jsonb,
  '[
    {
      "id": "hero-acofal",
      "type": "hero",
      "order": 0,
      "visible": true,
      "title": "Hero",
      "content": {
        "title": "ACOFAL",
        "subtitle": "Matériaux & Finitions — SIB 2026",
        "description": "Spécialiste des matériaux de construction et de finition au Maroc. Découvrez nos solutions pour vos projets résidentiels et tertiaires.",
        "ctaText": "Découvrir nos produits",
        "ctaLink": "#products",
        "backgroundImage": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
        "overlayOpacity": 0.55
      }
    },
    {
      "id": "about-acofal",
      "type": "about",
      "order": 1,
      "visible": true,
      "title": "À propos",
      "content": {
        "title": "À propos d''ACOFAL",
        "description": "ACOFAL est un acteur reconnu du secteur des matériaux de construction au Maroc. Présente au SIB 2026, la société expose sa gamme complète de matériaux de finition — peintures, enduits, revêtements de sol et carrelages — destinés aussi bien aux professionnels qu''aux particuliers. Engagée dans la qualité et l''innovation, ACOFAL accompagne ses clients de la conception à la livraison.",
        "mission": "Fournir aux professionnels du bâtiment des matériaux de finition de haute qualité, durables et accessibles.",
        "vision": "Devenir la référence marocaine des matériaux de finition pour un habitat confortable et esthétique.",
        "features": [
          "Gamme complète de finitions intérieures & extérieures",
          "Produits conformes aux normes marocaines",
          "Conseil technique personnalisé",
          "Livraison sur chantier partout au Maroc"
        ],
        "stats": [
          {"label": "Années d''expérience", "value": "15+"},
          {"label": "Références produits", "value": "500+"},
          {"label": "Chantiers réalisés", "value": "2 000+"},
          {"label": "Régions couvertes", "value": "12"}
        ],
        "certifications": [
          {"name": "NM 01.4.401", "issuer": "IMANOR", "description": "Norme marocaine peintures & revêtements"},
          {"name": "ISO 9001:2015", "issuer": "Bureau Veritas", "description": "Système de management de la qualité"}
        ]
      }
    },
    {
      "id": "products-acofal",
      "type": "products",
      "order": 2,
      "visible": true,
      "title": "Produits & Services",
      "content": {
        "title": "Nos Produits",
        "description": "Une gamme complète de matériaux de finition pour tous vos projets de construction et de rénovation.",
        "products": [
          {
            "name": "Peintures intérieures",
            "description": "Peintures acryliques et vinyliques pour murs et plafonds. Finitions mate, satinée et brillante. Haute opacité et lavabilité.",
            "category": "Peintures",
            "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80",
            "features": ["Haute couvrance", "Lavable", "Anti-moisissure", "Large palette RAL"]
          },
          {
            "name": "Peintures de façade",
            "description": "Peintures spéciales façade résistantes aux intempéries, aux UV et à l''efflorescence.",
            "category": "Peintures",
            "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
            "features": ["Résistance UV", "Imperméable", "Anti-efflorescence", "Longue durée"]
          },
          {
            "name": "Enduits de finition",
            "description": "Enduits de lissage et de finition pour obtenir des surfaces parfaitement planes avant peinture.",
            "category": "Enduits",
            "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
            "features": ["Application facile", "Séchage rapide", "Ponçable", "Compatible toutes peintures"]
          },
          {
            "name": "Revêtements de sol",
            "description": "Carrelages, parquets stratifiés et vinyles de qualité pour sols intérieurs et extérieurs.",
            "category": "Revêtements",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
            "features": ["Résistance abrasion classe 5", "Anti-glissement R11", "Facile d''entretien", "Large choix de formats"]
          },
          {
            "name": "Colles & joints carrelage",
            "description": "Mortiers-colles et joints de jointement pour la pose de carrelage sur tous types de supports.",
            "category": "Colles & Mortiers",
            "image": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
            "features": ["C2 déformable", "Antidérapant", "Résistant à l''humidité", "Pour sols chauffants"]
          },
          {
            "name": "Imperméabilisants",
            "description": "Solutions d''imperméabilisation des façades, balcons, terrasses et surfaces exposées.",
            "category": "Imperméabilisation",
            "image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
            "features": ["Profonde pénétration", "Invisible", "Résistant aux cycles gel/dégel", "Durable 10 ans"]
          }
        ]
      }
    },
    {
      "id": "services-acofal",
      "type": "services",
      "order": 3,
      "visible": true,
      "title": "Services",
      "content": {
        "title": "Nos Services",
        "description": "Au-delà de la fourniture de matériaux, ACOFAL vous accompagne à chaque étape de votre projet.",
        "services": [
          {
            "name": "Conseil technique",
            "description": "Nos techniciens vous conseillent sur le choix des produits adaptés à vos supports et conditions de chantier.",
            "icon": "Wrench"
          },
          {
            "name": "Formation applicateurs",
            "description": "Sessions de formation pratique pour les applicateurs professionnels à nos nouvelles gammes de produits.",
            "icon": "GraduationCap"
          },
          {
            "name": "Livraison chantier",
            "description": "Service de livraison directement sur vos chantiers partout au Maroc, avec suivi de commande en ligne.",
            "icon": "Truck"
          },
          {
            "name": "Assistance SAV",
            "description": "Support après-vente réactif pour tout problème technique lié à la mise en œuvre de nos produits.",
            "icon": "HeadphonesIcon"
          }
        ]
      }
    },
    {
      "id": "gallery-acofal",
      "type": "gallery",
      "order": 4,
      "visible": true,
      "title": "Galerie",
      "content": {
        "title": "Réalisations",
        "description": "Quelques exemples de réalisations avec les produits ACOFAL.",
        "images": [
          {"url": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80", "description": "Peinture intérieure — résidence Casablanca"},
          {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", "description": "Pose carrelage grand format — hôtel Marrakech"},
          {"url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80", "description": "Ravalement de façade — immeuble Rabat"},
          {"url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", "description": "Enduit finition lissé — bureau Tanger"}
        ]
      }
    },
    {
      "id": "contact-acofal",
      "type": "contact",
      "order": 5,
      "visible": true,
      "title": "Contact",
      "content": {
        "title": "Nous contacter",
        "description": "Prenez rendez-vous sur le stand ACOFAL au SIB 2026 ou contactez-nous directement.",
        "email": "contact@acofal.ma",
        "phone": "+212 5 22 00 00 00",
        "address": "Casablanca, Maroc",
        "standInfo": "Stand SIB 2026 — Hall Matériaux & Finitions",
        "social": {
          "linkedin": "https://www.linkedin.com/company/acofal",
          "facebook": "https://www.facebook.com/acofal.maroc"
        }
      }
    }
  ]'::jsonb,
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  theme        = EXCLUDED.theme,
  custom_colors= EXCLUDED.custom_colors,
  sections     = EXCLUDED.sections,
  published    = EXCLUDED.published,
  last_updated = NOW();

-- ── 4b. Afrique Étanchéité ────────────────────────────────────────────
INSERT INTO public.mini_sites
  (id, exhibitor_id, theme, custom_colors, sections, published, views, last_updated, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000231'::uuid,
  '00000000-0000-0000-0000-000000000131'::uuid,
  'modern',
  '{"primary": "#B45309", "secondary": "#D97706", "accent": "#FEF3C7"}'::jsonb,
  '[
    {
      "id": "hero-etancheite",
      "type": "hero",
      "order": 0,
      "visible": true,
      "title": "Hero",
      "content": {
        "title": "Afrique Étanchéité",
        "subtitle": "Spécialiste de l''Étanchéité — SIB 2026 El Jadida",
        "description": "Solutions d''étanchéité professionnelles pour tous types de surfaces. Toitures-terrasses, façades, fondations, ponts et ouvrages d''art.",
        "ctaText": "Découvrir nos solutions",
        "ctaLink": "#products",
        "backgroundImage": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80",
        "overlayOpacity": 0.6
      }
    },
    {
      "id": "about-etancheite",
      "type": "about",
      "order": 1,
      "visible": true,
      "title": "À propos",
      "content": {
        "title": "À propos d''Afrique Étanchéité",
        "description": "Afrique Étanchéité est une entreprise marocaine spécialisée dans les travaux d''étanchéité pour le bâtiment et le génie civil. Forte d''une expertise accumulée sur de nombreux chantiers résidentiels, hôteliers et industriels, elle intervient sur la prévention et le traitement des infiltrations d''eau sur toutes natures de supports. Partenaire de confiance des architectes, bureaux d''études et entreprises de construction, Afrique Étanchéité est présente au SIB 2026 à El Jadida pour présenter ses dernières solutions techniques.",
        "mission": "Protéger durablement les ouvrages contre les infiltrations d''eau grâce à des systèmes d''étanchéité performants et éprouvés.",
        "vision": "Être la référence africaine de l''étanchéité du bâtiment, en alliant innovation technique et respect des normes internationales.",
        "features": [
          "Étanchéité toitures-terrasses accessibles & inaccessibles",
          "Traitement des façades et murs enterrés",
          "Systèmes d''injection anti-infiltrations",
          "Garantie décennale sur les travaux"
        ],
        "stats": [
          {"label": "Années d''expertise", "value": "20+"},
          {"label": "Chantiers réalisés", "value": "1 500+"},
          {"label": "m² traités/an", "value": "50 000+"},
          {"label": "Villes couvertes", "value": "30+"}
        ],
        "certifications": [
          {"name": "DTU 43.1", "issuer": "CSTB", "description": "Travaux d''étanchéité des toitures avec éléments porteurs"},
          {"name": "DTU 43.5", "issuer": "CSTB", "description": "Réfection des ouvrages d''étanchéité des toitures"},
          {"name": "ISO 9001:2015", "issuer": "AFNOR Certification", "description": "Management de la qualité"}
        ]
      }
    },
    {
      "id": "products-etancheite",
      "type": "products",
      "order": 2,
      "visible": true,
      "title": "Produits & Solutions",
      "content": {
        "title": "Nos Solutions d''Étanchéité",
        "description": "Des systèmes d''étanchéité adaptés à chaque type d''ouvrage et de contrainte.",
        "products": [
          {
            "name": "Étanchéité toiture-terrasse bicouche",
            "description": "Système bitumineux bicouche SBS/APP pour toitures-terrasses accessibles et inaccessibles. Membrane d''armature en voile de verre ou polyester.",
            "category": "Étanchéité Toiture",
            "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
            "features": ["Résistance UV classe W1", "Tenue en température -20°C / +100°C", "Résistance au poinçonnement statique", "Garantie 10 ans"]
          },
          {
            "name": "Membrane EPDM",
            "description": "Membrane en caoutchouc EPDM vulcanisé pour toitures à faible pente. Mise en œuvre par collage ou fixation mécanique.",
            "category": "Étanchéité Toiture",
            "image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
            "features": ["Durée de vie 50 ans", "Recyclable", "Joint soudé à chaud", "Classe anti-feu Broof(t1)"]
          },
          {
            "name": "Imperméabilisation façades",
            "description": "Systèmes d''imperméabilisation des façades par application de revêtements cristallisants ou hydrofuges de masse.",
            "category": "Façades",
            "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
            "features": ["Pénétration en profondeur", "Résistance cycles gel/dégel", "Perméabilité à la vapeur", "Aspect inchangé"]
          },
          {
            "name": "Injection polyuréthane anti-infiltration",
            "description": "Injection de résines polyuréthane expansives pour colmater les fissures et joints actifs dans les structures béton.",
            "category": "Traitement Fissures",
            "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
            "features": ["Efficace sur fissures actives", "Prise rapide en milieu humide", "Expansion contrôlable", "Compatible béton & maçonnerie"]
          },
          {
            "name": "Cuvelage fondations",
            "description": "Système de cuvelage tanking pour la protection des sous-sols et fondations contre les remontées d''eau.",
            "category": "Fondations",
            "image": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
            "features": ["Résistance à la pression hydrostatique 5 bars", "Application intrados/extrados", "Compatible béton armé", "Garantie 10 ans"]
          },
          {
            "name": "Étanchéité ponts & parkings",
            "description": "Revêtements d''étanchéité et de protection pour tabliers de ponts, parkings couverts et dalles sur terre-plein.",
            "category": "Génie Civil",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
            "features": ["Résistance passage véhicules", "Anti-dérapant R11", "Résistance carburants", "Coloration RAL au choix"]
          }
        ]
      }
    },
    {
      "id": "services-etancheite",
      "type": "services",
      "order": 3,
      "visible": true,
      "title": "Services",
      "content": {
        "title": "Nos Prestations",
        "description": "De l''audit au suivi de chantier, Afrique Étanchéité vous accompagne sur tout le cycle de vie de votre étanchéité.",
        "services": [
          {
            "name": "Diagnostic & Audit",
            "description": "Inspection complète de vos ouvrages pour identifier les causes des infiltrations et établir un plan de traitement.",
            "icon": "Search"
          },
          {
            "name": "Étude technique",
            "description": "Préconisation de systèmes d''étanchéité adaptés à votre ouvrage, avec calcul de mise en œuvre et CCTP.",
            "icon": "FileText"
          },
          {
            "name": "Travaux d''étanchéité",
            "description": "Réalisation des travaux par nos équipes certifiées : pose membranes, injections, traitement façades.",
            "icon": "Wrench"
          },
          {
            "name": "Suivi & Maintenance",
            "description": "Contrats d''entretien préventif et interventions curatives rapides pour maintenir vos ouvrages en parfait état.",
            "icon": "Shield"
          }
        ]
      }
    },
    {
      "id": "gallery-etancheite",
      "type": "gallery",
      "order": 4,
      "visible": true,
      "title": "Galerie",
      "content": {
        "title": "Chantiers Réalisés",
        "description": "Quelques exemples de chantiers d''étanchéité réalisés par Afrique Étanchéité.",
        "images": [
          {"url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", "description": "Étanchéité toiture-terrasse — Résidence Casablanca"},
          {"url": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80", "description": "Membrane EPDM — Entrepôt logistique Tanger"},
          {"url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80", "description": "Imperméabilisation façade — Hôtel Agadir"},
          {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", "description": "Cuvelage parking souterrain — Tour Rabat"}
        ]
      }
    },
    {
      "id": "contact-etancheite",
      "type": "contact",
      "order": 5,
      "visible": true,
      "title": "Contact",
      "content": {
        "title": "Nous contacter",
        "description": "Retrouvez-nous sur le stand Afrique Étanchéité au SIB 2026, Hall Matériaux & Finitions.",
        "email": "contact@afrique-etancheite.ma",
        "phone": "+212 5 22 00 00 01",
        "address": "El Jadida, Maroc",
        "standInfo": "Stand SIB 2026 — Hall Matériaux & Finitions — El Jadida",
        "social": {
          "linkedin": "https://www.linkedin.com/company/afrique-etancheite",
          "facebook": "https://www.facebook.com/afrique.etancheite"
        }
      }
    }
  ]'::jsonb,
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  theme        = EXCLUDED.theme,
  custom_colors= EXCLUDED.custom_colors,
  sections     = EXCLUDED.sections,
  published    = EXCLUDED.published,
  last_updated = NOW();

-- ── 4c. Aifeiling Sanitary Wares ─────────────────────────────────────
INSERT INTO public.mini_sites
  (id, exhibitor_id, theme, custom_colors, sections, published, views, last_updated, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000232'::uuid,
  '00000000-0000-0000-0000-000000000132'::uuid,
  'modern',
  '{"primary": "#0e7490", "secondary": "#06b6d4", "accent": "#cffafe"}'::jsonb,
  '[
    {
      "id": "hero-aifeiling",
      "type": "hero",
      "order": 0,
      "visible": true,
      "title": "Hero",
      "content": {
        "title": "Aifeiling Sanitary Wares",
        "subtitle": "Top 10 Bain & Cuisine en Chine — SIB 2026",
        "description": "Fabricant leader de produits sanitaires premium : mobilier de salle de bain, baignoires, robinetterie intelligente, WC technologiques. Fondé en 2002, présent dans 80+ pays.",
        "ctaText": "Explorer nos collections",
        "ctaLink": "#products",
        "backgroundImage": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=80",
        "overlayOpacity": 0.5
      }
    },
    {
      "id": "about-aifeiling",
      "type": "about",
      "order": 1,
      "visible": true,
      "title": "À propos",
      "content": {
        "title": "À propos d''Aifeiling",
        "description": "Aifeiling Sanitary Wares Technology Group Co.,Ltd. est un groupe industriel fondé en 2002 à Foshan, Guangdong — capitale mondiale de la céramique et du sanitaire. Classé dans le Top 10 des entreprises Bain & Cuisine en Chine, Aifeiling conçoit et fabrique des produits sanitaires haut de gamme pour les marchés résidentiel, hôtelier et commercial. Fort d''une capacité de production annuelle de 3 millions d''unités et d''une présence dans plus de 80 pays, le groupe participe au SIB 2026 pour renforcer sa présence sur le marché africain et maghrébin.",
        "mission": "Concevoir des salles de bain intelligentes, esthétiques et durables accessibles au plus grand nombre.",
        "vision": "Être le leader mondial de la salle de bain connectée et éco-responsable d''ici 2030.",
        "features": [
          "Top 10 des entreprises sanitaires en Chine",
          "Présent dans 80+ pays à l''export",
          "Usine certifiée ISO 9001 & ISO 14001",
          "R&D : 200+ ingénieurs, 50 brevets actifs"
        ],
        "stats": [
          {"label": "Année de fondation", "value": "2002"},
          {"label": "Pays exportateurs", "value": "80+"},
          {"label": "Capacité prod./an", "value": "3 M unités"},
          {"label": "Brevets déposés", "value": "50+"}
        ],
        "certifications": [
          {"name": "ISO 9001:2015", "issuer": "SGS", "description": "Système de management de la qualité"},
          {"name": "ISO 14001:2015", "issuer": "TÜV", "description": "Management environnemental"},
          {"name": "CE Marking", "issuer": "EU", "description": "Conformité aux normes européennes"},
          {"name": "WRAS Approved", "issuer": "Water Regulations Advisory Scheme", "description": "Conformité eau potable UK"},
          {"name": "CUPC / cUPC", "issuer": "IAPMO", "description": "Certification sanitaire USA/Canada"}
        ]
      }
    },
    {
      "id": "products-aifeiling",
      "type": "products",
      "order": 2,
      "visible": true,
      "title": "Collections",
      "content": {
        "title": "Nos Collections",
        "description": "Des produits sanitaires alliant design contemporain, technologie avancée et durabilité.",
        "products": [
          {
            "name": "Mobilier de salle de bain",
            "description": "Meubles sous-vasque, colonnes et armoires de salle de bain en MDF hydrofuge laqué ou en bois massif. Quincaillerie soft-close, nombreuses finitions disponibles.",
            "category": "Mobilier",
            "image": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
            "features": ["MDF hydrofuge E0", "Quincaillerie Blum", "Finitions mate/brillante/bois", "Largeurs 60–120 cm"],
            "price": "Sur devis"
          },
          {
            "name": "Baignoires îlot & encastrées",
            "description": "Baignoires en acrylique renforcé, résine solid surface et fonte émaillée. Collection îlots autoportantes et modèles encastrés ou semi-encastrés.",
            "category": "Baignoires",
            "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
            "features": ["Solid surface Corian®", "Bain à remous disponible", "Longueurs 150–180 cm", "Garantie 10 ans surface"],
            "price": "À partir de 450 USD FOB"
          },
          {
            "name": "Robinetterie intelligente",
            "description": "Mitigeurs thermostatiques, robinets à capteur infrarouge et robinetterie connectée Bluetooth/WiFi avec contrôle de température et débit via application.",
            "category": "Robinetterie",
            "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
            "features": ["Capteur infrarouge sans contact", "Économie d''eau -40%", "Compatible Alexa/Google", "Laiton massif OT58"],
            "price": "À partir de 35 USD FOB"
          },
          {
            "name": "WC suspendus & intelligents",
            "description": "WC suspendus céramique vitrifiée, cuvettes rimless + WC washlet japonais avec siège chauffant, bidet intégré, désodorisation et ouverture automatique.",
            "category": "WC",
            "image": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
            "features": ["Rimless facile d''entretien", "Siège chauffant 5 niveaux", "Bidet eau chaude/froide", "Mode nuit silencieux"],
            "price": "À partir de 180 USD FOB"
          },
          {
            "name": "Douches & cabines",
            "description": "Receveurs de douche ultra-plats en résine, cabines de douche intégrales avec jets hydromassants, douches à l''italienne.",
            "category": "Douches",
            "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
            "features": ["Receveur 3 cm d''épaisseur", "Jets hydromassants 6 fonctions", "Verre sécurité 8 mm", "Traitement Easy Clean"],
            "price": "À partir de 280 USD FOB"
          },
          {
            "name": "Tuyaux flexibles & accessoires",
            "description": "Tuyaux de douche et flexibles de raccordement en inox brossé, douchettes à main et têtes de douche à économie d''eau.",
            "category": "Accessoires",
            "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
            "features": ["Inox 304 anti-corrosion", "Longueurs 1,5 m / 2 m", "Débit 6 L/min éco", "Compatibilité universelle"],
            "price": "À partir de 8 USD FOB"
          }
        ]
      }
    },
    {
      "id": "services-aifeiling",
      "type": "services",
      "order": 3,
      "visible": true,
      "title": "Services Export",
      "content": {
        "title": "Services & Avantages",
        "description": "Aifeiling accompagne ses distributeurs et importateurs à chaque étape du partenariat commercial.",
        "services": [
          {
            "name": "OEM / ODM sur mesure",
            "description": "Fabrication à la marque ou développement de nouveaux produits selon vos spécifications techniques et design.",
            "icon": "Settings"
          },
          {
            "name": "Showroom & échantillons",
            "description": "Accès à notre showroom de 5 000 m² à Foshan et envoi d''échantillons gratuits pour sélection.",
            "icon": "Eye"
          },
          {
            "name": "Support logistique export",
            "description": "Gestion complète de l''export : packaging, documentation douanière, FCL/LCL, incoterms FOB/CIF/DAP.",
            "icon": "Package"
          },
          {
            "name": "Formation & Marketing",
            "description": "Catalogues multilingues, vidéos de produits, formation technique des équipes de vente partenaires.",
            "icon": "GraduationCap"
          }
        ]
      }
    },
    {
      "id": "gallery-aifeiling",
      "type": "gallery",
      "order": 4,
      "visible": true,
      "title": "Galerie",
      "content": {
        "title": "Galerie Produits",
        "description": "Découvrez l''étendue de nos collections sanitaires.",
        "images": [
          {"url": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", "description": "Collection mobilier salle de bain Série Élite"},
          {"url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", "description": "Baignoire îlot Série Prestige"},
          {"url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", "description": "Robinetterie connectée Série Smart"},
          {"url": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", "description": "WC washlet Série Zen — SIB 2026"}
        ]
      }
    },
    {
      "id": "contact-aifeiling",
      "type": "contact",
      "order": 5,
      "visible": true,
      "title": "Contact",
      "content": {
        "title": "Nous contacter",
        "description": "Visitez notre stand au SIB 2026 ou contactez notre équipe export pour un devis personnalisé.",
        "email": "export@aifeiling.com",
        "phone": "+86 757 8888 0000",
        "address": "Aifeiling Industrial Zone, Foshan, Guangdong 528000, Chine",
        "standInfo": "Stand SIB 2026 — Hall Sanitaire & Plomberie — El Jadida",
        "social": {
          "linkedin": "https://www.linkedin.com/company/aifeiling",
          "facebook": "https://www.facebook.com/aifeiling.sanitary",
          "instagram": "https://www.instagram.com/aifeiling_official",
          "youtube": "https://www.youtube.com/@aifeiling"
        }
      }
    }
  ]'::jsonb,
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  theme        = EXCLUDED.theme,
  custom_colors= EXCLUDED.custom_colors,
  sections     = EXCLUDED.sections,
  published    = EXCLUDED.published,
  last_updated = NOW();

-- ─────────────────────────────────────────────────────────────────────
-- 5. RÉACTIVER LES TRIGGERS
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.exhibitors ENABLE TRIGGER USER;

-- ─────────────────────────────────────────────────────────────────────
-- RÉSUMÉ
-- Exposants créés / mis à jour :
--   1. ACOFAL              (id=...0130) — Matériaux & Finitions — 6 sections
--   2. Afrique Étanchéité  (id=...0131) — Matériaux & Finitions — 6 sections
--   3. Aifeiling Sanitary  (id=...0132) — Sanitaire & Plomberie — 6 sections
--
-- Sections peuplées pour chaque mini-site :
--   hero · about (mission/vision/stats/certifications) · products (6 produits)
--   services (4 services) · gallery (4 photos) · contact (réseaux sociaux)
--
-- Connexion demo : <email>@sib2026.ma / Exposant2026!
-- ─────────────────────────────────────────────────────────────────────
