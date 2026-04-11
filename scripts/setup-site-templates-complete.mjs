#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

console.log('🚀 Création complète de la table site_templates et des templates...\n');

async function main() {
  try {
    // Étape 1: Créer la table site_templates si elle n'existe pas
    console.log('📋 Étape 1: Création de la table site_templates...\n');

    const createTableSQL = `
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
    `;

    // Essayer d'exécuter via une requête REST directe
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: createTableSQL
      })
    });

    if (response.ok) {
      console.log('✅ Table site_templates créée avec succès!\n');
    } else {
      console.log('⚠️  Impossible de créer la table via API REST');
      console.log('⚠️  Vous devez créer la table manuellement dans Supabase Dashboard\n');
      console.log('📝 Copiez et exécutez ce SQL dans Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log(createTableSQL);
      console.log('----------------------------------------\n');
      
      console.log('📌 Instructions:');
      console.log('   1. Allez sur https://supabase.com/dashboard');
      console.log('   2. Sélectionnez votre projet');
      console.log('   3. Cliquez sur "SQL Editor" dans le menu de gauche');
      console.log('   4. Créez une nouvelle requête');
      console.log('   5. Collez le SQL ci-dessus');
      console.log('   6. Cliquez sur "Run"');
      console.log('   7. Puis relancez ce script: node scripts/create-site-templates.mjs\n');
      
      process.exit(1);
    }

    // Étape 2: Insérer les templates
    console.log('📦 Étape 2: Insertion des templates...\n');

    const templates = [
      {
        id: 'template-corporate-1',
        name: 'Corporate Professional',
        description: 'Template professionnel pour entreprises établies avec sections complètes',
        category: 'corporate',
        thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 250,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Solutions d'Excellence pour l'Industrie Maritime",
              subtitle: "Leader mondial en technologie portuaire depuis 1995",
              backgroundImage: "",
              ctaText: "Découvrir nos solutions",
              ctaLink: "#products"
            },
            order: 0,
            visible: true
          },
          {
            id: "about-1",
            type: "about",
            content: {
              title: "Notre Expertise",
              description: "Avec plus de 25 ans d'expérience, nous accompagnons les ports du monde entier dans leur transformation digitale.",
              image: ""
            },
            order: 1,
            visible: true
          },
          {
            id: "products-1",
            type: "products",
            content: {
              title: "Nos Solutions",
              items: []
            },
            order: 2,
            visible: true
          },
          {
            id: "contact-1",
            type: "contact",
            content: {
              title: "Contactez-nous",
              email: "contact@example.com",
              phone: "+212 5XX XXX XXX",
              address: "",
              formFields: ["name", "email", "company", "message"]
            },
            order: 3,
            visible: true
          }
        ]
      },
      {
        id: 'template-startup-1',
        name: 'Startup Moderne',
        description: 'Design moderne et dynamique pour startups innovantes',
        category: 'startup',
        thumbnail: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 180,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Innovation Maritime 🚀",
              subtitle: "La prochaine génération de solutions portuaires intelligentes",
              backgroundImage: "",
              ctaText: "Rejoignez la révolution",
              ctaLink: "#about"
            },
            order: 0,
            visible: true
          },
          {
            id: "about-1",
            type: "about",
            content: {
              title: "Notre Mission",
              description: "Révolutionner l'industrie maritime avec l'IA et l'IoT pour créer des ports plus efficaces et durables.",
              image: ""
            },
            order: 1,
            visible: true
          }
        ]
      },
      {
        id: 'template-ecommerce-1',
        name: 'E-commerce Pro',
        description: 'Template optimisé pour la vente en ligne avec galerie produits',
        category: 'ecommerce',
        thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: true,
        popularity: 320,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Équipements Maritimes Premium",
              subtitle: "Livraison mondiale • Garantie 5 ans • Support 24/7",
              backgroundImage: "",
              ctaText: "Voir le catalogue",
              ctaLink: "#products"
            },
            order: 0,
            visible: true
          },
          {
            id: "products-1",
            type: "products",
            content: {
              title: "Nos Produits Phares",
              items: []
            },
            order: 1,
            visible: true
          }
        ]
      },
      {
        id: 'template-landing-1',
        name: 'Landing Page Impact',
        description: "Page d'atterrissage avec fort taux de conversion",
        category: 'landing',
        thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 200,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Transformez Votre Port en Hub Intelligent",
              subtitle: "Augmentez l'efficacité de 40% dès le premier mois",
              backgroundImage: "",
              ctaText: "Demander une démo gratuite",
              ctaLink: "#contact"
            },
            order: 0,
            visible: true
          },
          {
            id: "contact-1",
            type: "contact",
            content: {
              title: "Démarrez Maintenant",
              email: "demo@example.com",
              phone: "+212 5XX XXX XXX",
              address: "",
              formFields: ["name", "email", "company", "phone"]
            },
            order: 2,
            visible: true
          }
        ]
      },
      {
        id: 'template-portfolio-1',
        name: 'Portfolio Créatif',
        description: 'Présentez vos réalisations de manière élégante',
        category: 'portfolio',
        thumbnail: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 150,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Nos Réalisations d'Excellence",
              subtitle: "Plus de 200 projets maritimes réussis à travers le monde",
              backgroundImage: "",
              ctaText: "Découvrir nos projets",
              ctaLink: "#products"
            },
            order: 0,
            visible: true
          },
          {
            id: "products-1",
            type: "products",
            content: {
              title: "Projets Phares",
              items: []
            },
            order: 1,
            visible: true
          }
        ]
      },
      {
        id: 'template-event-1',
        name: 'Événement Premium',
        description: 'Template pour salons et événements professionnels',
        category: 'event',
        thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: true,
        popularity: 280,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Salon Maritime International 2026",
              subtitle: "25-28 Juin • Casablanca • Plus de 10 000 visiteurs attendus",
              backgroundImage: "",
              ctaText: "Réserver votre stand",
              ctaLink: "#contact"
            },
            order: 0,
            visible: true
          },
          {
            id: "about-1",
            type: "about",
            content: {
              title: "À Propos de l'Événement",
              description: "Le plus grand rassemblement de professionnels du secteur maritime en Afrique. Rencontrez les leaders du secteur.",
              image: ""
            },
            order: 1,
            visible: true
          }
        ]
      },
      {
        id: 'template-agency-1',
        name: 'Agence Digitale',
        description: 'Pour agences de communication et marketing',
        category: 'agency',
        thumbnail: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 140,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Votre Partenaire Marketing Maritime",
              subtitle: "Stratégies digitales qui propulsent votre business",
              backgroundImage: "",
              ctaText: "Parlons de votre projet",
              ctaLink: "#contact"
            },
            order: 0,
            visible: true
          }
        ]
      },
      {
        id: 'template-product-1',
        name: 'Showcase Produit',
        description: 'Mettez en valeur un produit ou service unique',
        category: 'product',
        thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 190,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Système de Gestion Portuaire NextGen",
              subtitle: "L'outil ultime pour optimiser vos opérations portuaires",
              backgroundImage: "",
              ctaText: "Essayer gratuitement",
              ctaLink: "#contact"
            },
            order: 0,
            visible: true
          },
          {
            id: "products-1",
            type: "products",
            content: {
              title: "Fonctionnalités Clés",
              items: []
            },
            order: 1,
            visible: true
          }
        ]
      },
      {
        id: 'template-blog-1',
        name: 'Blog Professionnel',
        description: 'Partagez votre expertise et actualités du secteur',
        category: 'blog',
        thumbnail: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 120,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Actualités & Insights Maritimes",
              subtitle: "Les dernières tendances et innovations du secteur",
              backgroundImage: "",
              ctaText: "Lire nos articles",
              ctaLink: "#about"
            },
            order: 0,
            visible: true
          }
        ]
      },
      {
        id: 'template-minimal-1',
        name: 'Minimaliste Élégant',
        description: 'Design épuré et moderne pour un impact maximal',
        category: 'minimal',
        thumbnail: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600',
        premium: false,
        popularity: 160,
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Simplicité & Performance",
              subtitle: "L'essentiel, rien de plus",
              backgroundImage: "",
              ctaText: "En savoir plus",
              ctaLink: "#about"
            },
            order: 0,
            visible: true
          },
          {
            id: "contact-1",
            type: "contact",
            content: {
              title: "Contact",
              email: "contact@example.com",
              phone: "",
              address: "",
              formFields: ["name", "email", "message"]
            },
            order: 1,
            visible: true
          }
        ]
      }
    ];

    for (const template of templates) {
      const { error: insertError } = await supabase
        .from('site_templates')
        .upsert(template, { onConflict: 'id' });

      if (insertError) {
        console.error(`❌ Erreur pour ${template.name}:`, insertError.message);
      } else {
        const premiumBadge = template.premium ? '⭐' : '  ';
        console.log(`✅ ${premiumBadge} ${template.name} (${template.category}) - ${template.popularity} utilisations`);
      }
    }

    // Vérifier les templates créés
    console.log('\n🔍 Vérification des templates créés...\n');
    const { data: allTemplates, error: fetchError } = await supabase
      .from('site_templates')
      .select('id, name, category, popularity, premium')
      .order('popularity', { ascending: false });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError.message);
    } else {
      console.log(`\n✅ ${allTemplates.length} templates disponibles au total:\n`);
      allTemplates.forEach((t, i) => {
        const premiumBadge = t.premium ? '⭐ PREMIUM' : '';
        console.log(`   ${i + 1}. ${t.name} (${t.category}) - ${t.popularity} utilisations ${premiumBadge}`);
      });
    }

    console.log('\n✅ Templates créés avec succès!');
    console.log('\n📌 Prochaines étapes:');
    console.log('   1. Redémarrez le serveur de développement (npm run dev)');
    console.log('   2. Connectez-vous en tant qu\'exposant');
    console.log('   3. Accédez à /exhibitor/minisite/create');
    console.log('   4. Cliquez sur "Partir d\'un template"');
    console.log('   5. Vous verrez maintenant tous les templates disponibles!\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
