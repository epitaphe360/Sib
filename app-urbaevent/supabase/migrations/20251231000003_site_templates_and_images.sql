-- ============================================================================
-- MIGRATION: Site Templates & Images
-- Date: 2025-12-31
-- Description: Tables pour templates de mini-sites et bibliothèque d'images
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: site_templates
-- Description: Templates pré-configurés pour les mini-sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'corporate', 'ecommerce', 'portfolio', 'event',
    'landing', 'startup', 'agency', 'product', 'blog', 'minimal'
  )),
  thumbnail text,
  sections jsonb DEFAULT '[]'::jsonb,
  premium boolean DEFAULT false,
  popularity integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_templates_category ON public.site_templates(category);
CREATE INDEX IF NOT EXISTS idx_site_templates_popularity ON public.site_templates(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_site_templates_premium ON public.site_templates(premium);

-- RLS
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site templates" ON public.site_templates;
CREATE POLICY "Anyone can view site templates" ON public.site_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site templates" ON public.site_templates;
CREATE POLICY "Admins can manage site templates" ON public.site_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 2. TABLE: site_images
-- Description: Bibliothèque d'images pour les mini-sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  name text NOT NULL,
  size bigint NOT NULL,
  storage_path text NOT NULL,

  -- Ownership
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  exhibitor_id uuid REFERENCES public.exhibitors(id) ON DELETE CASCADE,

  -- Metadata
  mime_type text,
  width integer,
  height integer,
  alt_text text,
  tags text[] DEFAULT '{}',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_images_user_id ON public.site_images(user_id);
CREATE INDEX IF NOT EXISTS idx_site_images_exhibitor_id ON public.site_images(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_site_images_created_at ON public.site_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_images_tags ON public.site_images USING GIN(tags);

-- RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own images" ON public.site_images;
CREATE POLICY "Users can view their own images" ON public.site_images
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = site_images.exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can upload images" ON public.site_images;
CREATE POLICY "Users can upload images" ON public.site_images
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own images" ON public.site_images;
CREATE POLICY "Users can delete their own images" ON public.site_images
  FOR DELETE USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = site_images.exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. STORAGE BUCKETS
-- ============================================================================

-- Bucket pour les images des mini-sites (via Supabase Dashboard ou CLI)
-- À créer: site-images (public: true, max size: 5MB)

-- Policies RLS pour le bucket site-images:
-- SELECT: Auth users seulement
-- INSERT: Auth users seulement
-- DELETE: Owner seulement

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_site_templates_updated_at ON public.site_templates;
CREATE TRIGGER update_site_templates_updated_at
  BEFORE UPDATE ON public.site_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

DROP TRIGGER IF EXISTS update_site_images_updated_at ON public.site_images;
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

-- ============================================================================
-- 5. SEED DEFAULT TEMPLATES
-- ============================================================================

-- Template Corporate
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-corporate-1',
  'Corporate Professional',
  'Template professionnel pour entreprises établies avec sections complètes',
  'corporate',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Solutions d''Excellence pour l''Industrie Maritime",
        "subtitle": "Leader mondial en technologie portuaire depuis 1995",
        "backgroundImage": "",
        "ctaText": "Découvrir nos solutions",
        "ctaLink": "#products"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "about-1",
      "type": "about",
      "content": {
        "title": "Notre Expertise",
        "description": "Avec plus de 25 ans d''expérience, nous accompagnons les ports du monde entier dans leur transformation digitale.",
        "image": ""
      },
      "order": 1,
      "visible": true
    },
    {
      "id": "products-1",
      "type": "products",
      "content": {
        "title": "Nos Solutions",
        "items": []
      },
      "order": 2,
      "visible": true
    },
    {
      "id": "contact-1",
      "type": "contact",
      "content": {
        "title": "Contactez-nous",
        "email": "contact@example.com",
        "phone": "+212 5XX XXX XXX",
        "address": "",
        "formFields": ["name", "email", "company", "message"]
      },
      "order": 3,
      "visible": true
    }
  ]'::jsonb,
  false,
  250
)
ON CONFLICT (id) DO NOTHING;

-- Template Startup
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-startup-1',
  'Startup Moderne',
  'Design moderne et dynamique pour startups innovantes',
  'startup',
  'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Innovation Maritime 🚀",
        "subtitle": "La prochaine génération de solutions portuaires intelligentes",
        "backgroundImage": "",
        "ctaText": "Rejoignez la révolution",
        "ctaLink": "#about"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "about-1",
      "type": "about",
      "content": {
        "title": "Notre Mission",
        "description": "Révolutionner l''industrie maritime avec l''IA et l''IoT pour créer des ports plus efficaces et durables.",
        "image": ""
      },
      "order": 1,
      "visible": true
    }
  ]'::jsonb,
  false,
  180
)
ON CONFLICT (id) DO NOTHING;

-- Template E-commerce
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-ecommerce-1',
  'E-commerce Pro',
  'Template optimisé pour la vente en ligne avec galerie produits',
  'ecommerce',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Équipements Maritimes Premium",
        "subtitle": "Livraison mondiale • Garantie 5 ans • Support 24/7",
        "backgroundImage": "",
        "ctaText": "Voir le catalogue",
        "ctaLink": "#products"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "products-1",
      "type": "products",
      "content": {
        "title": "Nos Produits Phares",
        "items": []
      },
      "order": 1,
      "visible": true
    }
  ]'::jsonb,
  true,
  320
)
ON CONFLICT (id) DO NOTHING;

-- Template Landing Page
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-landing-1',
  'Landing Page Impact',
  'Page d''atterrissage avec fort taux de conversion',
  'landing',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Transformez Votre Port en Hub Intelligent",
        "subtitle": "Augmentez l''efficacité de 40% dès le premier mois",
        "backgroundImage": "",
        "ctaText": "Demander une démo gratuite",
        "ctaLink": "#contact"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "contact-1",
      "type": "contact",
      "content": {
        "title": "Démarrez Maintenant",
        "email": "demo@example.com",
        "phone": "+212 5XX XXX XXX",
        "address": "",
        "formFields": ["name", "email", "company", "phone"]
      },
      "order": 2,
      "visible": true
    }
  ]'::jsonb,
  false,
  200
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Créer un mini-site depuis un template:
-- SELECT * FROM site_templates WHERE category = 'corporate';
-- INSERT INTO mini_sites (title, slug, sections, exhibitor_id, template_id)
-- SELECT 'Mon Site', 'mon-site', sections, '<exhibitor_id>', id
-- FROM site_templates WHERE id = 'template-corporate-1';

-- Récupérer tous les templates d'une catégorie:
-- SELECT * FROM site_templates WHERE category = 'startup' ORDER BY popularity DESC;

-- Incrémenter la popularité d'un template:
-- UPDATE site_templates SET popularity = popularity + 1 WHERE id = 'template-corporate-1';
