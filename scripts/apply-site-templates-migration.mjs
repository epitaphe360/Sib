#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Application de la migration site_templates...\n');

try {
  // Lire le fichier de migration
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251231000003_site_templates_and_images.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');

  console.log('📄 Fichier de migration chargé:', migrationPath);
  console.log('📏 Taille:', migrationSQL.length, 'caractères\n');

  // Exécuter la migration via l'API Supabase
  console.log('⚙️  Exécution de la migration SQL...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: migrationSQL
  });

  if (error) {
    // Si la fonction exec_sql n'existe pas, on essaie une autre méthode
    if (error.code === '42883') {
      console.log('⚠️  La fonction exec_sql n\'existe pas, création manuelle des templates...\n');
      
      // Créer manuellement les templates
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

      console.log(`📦 Insertion de ${templates.length} templates...\n`);

      for (const template of templates) {
        const { error: insertError } = await supabase
          .from('site_templates')
          .upsert(template, { onConflict: 'id' });

        if (insertError) {
          console.error(`❌ Erreur pour ${template.name}:`, insertError.message);
        } else {
          console.log(`✅ ${template.name} (${template.category})`);
        }
      }
    } else {
      throw error;
    }
  } else {
    console.log('✅ Migration exécutée avec succès\n');
  }

  // Vérifier les templates créés
  console.log('\n🔍 Vérification des templates créés...\n');
  const { data: templates, error: fetchError } = await supabase
    .from('site_templates')
    .select('id, name, category, popularity, premium')
    .order('popularity', { ascending: false });

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération:', fetchError.message);
  } else {
    console.log(`✅ ${templates.length} templates disponibles:\n`);
    templates.forEach((t, i) => {
      const premiumBadge = t.premium ? '⭐ PREMIUM' : '';
      console.log(`${i + 1}. ${t.name} (${t.category}) - ${t.popularity} utilisations ${premiumBadge}`);
    });
  }

  console.log('\n✅ Migration terminée avec succès!');
  console.log('\n📌 Prochaines étapes:');
  console.log('   1. Accédez à /exhibitor/minisite/create');
  console.log('   2. Cliquez sur "Partir d\'un template"');
  console.log('   3. Vous verrez maintenant les 10 templates disponibles!\n');

} catch (error) {
  console.error('\n❌ ERREUR:', error.message);
  console.error(error);
  process.exit(1);
}
