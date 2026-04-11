// Site Templates Data
// This file contains pre-configured templates for the site builder

import type { SiteTemplate } from '../types/site-builder';

export const siteTemplates: SiteTemplate[] = [
  {
    id: 'corporate-pro',
    name: 'Corporate Pro',
    description: 'Template élégant pour entreprises établies avec sections complètes',
    category: 'corporate',
    thumbnail: '/templates/corporate-pro.jpg',
    premium: false,
    popularity: 245,
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Excellence & Innovation',
          subtitle: 'Votre partenaire de confiance depuis 20 ans',
          backgroundImage: '',
          ctaText: 'Découvrir nos services',
          ctaLink: '#services'
        }
      },
      {
        id: 'about-1',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'Notre Entreprise',
          description: 'Leader dans notre domaine, nous accompagnons nos clients vers le succès avec des solutions innovantes et personnalisées.',
          image: ''
        }
      },
      {
        id: 'products-1',
        type: 'products',
        order: 2,
        visible: true,
        content: {
          title: 'Nos Services',
          items: []
        }
      },
      {
        id: 'contact-1',
        type: 'contact',
        order: 3,
        visible: true,
        content: {
          title: 'Contactez-nous',
          email: 'contact@entreprise.com',
          phone: '+33 1 23 45 67 89',
          address: 'Paris, France',
          formFields: ['name', 'email', 'phone', 'message']
        }
      }
    ]
  },
  {
    id: 'ecommerce-modern',
    name: 'E-commerce Modern',
    description: 'Boutique en ligne moderne avec galerie produits et panier',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-modern.jpg',
    premium: true,
    popularity: 189,
    sections: [
      {
        id: 'hero-2',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Collection Exclusive 2024',
          subtitle: 'Découvrez nos nouveautés',
          ctaText: 'Voir la collection',
          ctaLink: '#products'
        }
      },
      {
        id: 'products-2',
        type: 'products',
        order: 1,
        visible: true,
        content: {
          title: 'Nos Produits Phares',
          items: []
        }
      },
      {
        id: 'testimonials-2',
        type: 'testimonials',
        order: 2,
        visible: true,
        content: {
          title: 'Avis Clients',
          items: []
        }
      },
      {
        id: 'contact-2',
        type: 'contact',
        order: 3,
        visible: true,
        content: {
          title: 'Service Client',
          email: 'support@shop.com',
          phone: '+33 1 23 45 67 89',
          formFields: ['name', 'email', 'message']
        }
      }
    ]
  },
  {
    id: 'portfolio-creative',
    name: 'Portfolio Créatif',
    description: 'Mise en valeur de vos réalisations avec galerie photo dynamique',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-creative.jpg',
    premium: false,
    popularity: 312,
    sections: [
      {
        id: 'hero-3',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Designer & Créatif',
          subtitle: 'Transformons vos idées en réalité',
          ctaText: 'Voir mon travail',
          ctaLink: '#gallery'
        }
      },
      {
        id: 'about-3',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'À Propos',
          description: 'Designer passionné avec 10 ans d\'expérience dans la création visuelle et le branding.',
          image: ''
        }
      },
      {
        id: 'gallery-3',
        type: 'gallery',
        order: 2,
        visible: true,
        content: {
          title: 'Mes Réalisations',
          images: []
        }
      },
      {
        id: 'contact-3',
        type: 'contact',
        order: 3,
        visible: true,
        content: {
          title: 'Travaillons Ensemble',
          email: 'hello@designer.com',
          formFields: ['name', 'email', 'project', 'message']
        }
      }
    ]
  },
  {
    id: 'event-summit',
    name: 'Event Summit',
    description: 'Template parfait pour salons et événements professionnels',
    category: 'event',
    thumbnail: '/templates/event-summit.jpg',
    premium: false,
    popularity: 156,
    sections: [
      {
        id: 'hero-4',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'SIB Summit 2024',
          subtitle: 'Le rendez-vous des professionnels du sport',
          ctaText: 'S\'inscrire maintenant',
          ctaLink: '#register'
        }
      },
      {
        id: 'about-4',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'L\'Événement',
          description: '3 jours de conférences, networking et découvertes avec les leaders de l\'industrie.',
          image: ''
        }
      },
      {
        id: 'video-4',
        type: 'video',
        order: 2,
        visible: true,
        content: {
          title: 'Revivez l\'édition 2023',
          videoUrl: '',
          autoplay: false
        }
      },
      {
        id: 'contact-4',
        type: 'contact',
        order: 3,
        visible: true,
        content: {
          title: 'Inscription',
          email: 'register@summit.com',
          formFields: ['name', 'email', 'company', 'role']
        }
      }
    ]
  },
  {
    id: 'landing-saas',
    name: 'SaaS Landing',
    description: 'Landing page optimisée conversion pour produits SaaS',
    category: 'landing',
    thumbnail: '/templates/landing-saas.jpg',
    premium: true,
    popularity: 423,
    sections: [
      {
        id: 'hero-5',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Révolutionnez votre workflow',
          subtitle: 'La solution tout-en-un pour votre entreprise',
          ctaText: 'Essai gratuit 14 jours',
          ctaLink: '#signup'
        }
      },
      {
        id: 'about-5',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'Pourquoi nous choisir ?',
          description: 'Simple, puissant, et conçu pour vous faire gagner du temps.',
          image: ''
        }
      },
      {
        id: 'testimonials-5',
        type: 'testimonials',
        order: 2,
        visible: true,
        content: {
          title: 'Ils nous font confiance',
          items: []
        }
      }
    ]
  },
  {
    id: 'startup-tech',
    name: 'Startup Tech',
    description: 'Design moderne pour startups tech et innovantes',
    category: 'startup',
    thumbnail: '/templates/startup-tech.jpg',
    premium: false,
    popularity: 198,
    sections: [
      {
        id: 'hero-6',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'L\'avenir commence maintenant',
          subtitle: 'Innovation • Technologie • Impact',
          ctaText: 'En savoir plus',
          ctaLink: '#about'
        }
      },
      {
        id: 'about-6',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'Notre Mission',
          description: 'Créer des solutions technologiques qui changent la donne.',
          image: ''
        }
      },
      {
        id: 'products-6',
        type: 'products',
        order: 2,
        visible: true,
        content: {
          title: 'Nos Solutions',
          items: []
        }
      }
    ]
  },
  {
    id: 'agency-creative',
    name: 'Creative Agency',
    description: 'Vitrine élégante pour agences créatives et marketing',
    category: 'agency',
    thumbnail: '/templates/agency-creative.jpg',
    premium: true,
    popularity: 267,
    sections: [
      {
        id: 'hero-7',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Créativité Sans Limites',
          subtitle: 'Votre agence créative de confiance',
          ctaText: 'Découvrir nos projets',
          ctaLink: '#work'
        }
      },
      {
        id: 'gallery-7',
        type: 'gallery',
        order: 1,
        visible: true,
        content: {
          title: 'Nos Réalisations',
          images: []
        }
      },
      {
        id: 'testimonials-7',
        type: 'testimonials',
        order: 2,
        visible: true,
        content: {
          title: 'Ce que disent nos clients',
          items: []
        }
      }
    ]
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Lancement de produit avec impact maximal',
    category: 'product',
    thumbnail: '/templates/product-launch.jpg',
    premium: false,
    popularity: 134,
    sections: [
      {
        id: 'hero-8',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Nouveau Produit Révolutionnaire',
          subtitle: 'Disponible dès maintenant',
          ctaText: 'Précommander',
          ctaLink: '#order'
        }
      },
      {
        id: 'video-8',
        type: 'video',
        order: 1,
        visible: true,
        content: {
          title: 'Découvrez le produit en action',
          videoUrl: '',
          autoplay: false
        }
      },
      {
        id: 'about-8',
        type: 'about',
        order: 2,
        visible: true,
        content: {
          title: 'Caractéristiques',
          description: 'Un produit pensé dans les moindres détails pour votre confort.',
          image: ''
        }
      }
    ]
  },
  {
    id: 'blog-magazine',
    name: 'Blog Magazine',
    description: 'Blog moderne avec mise en page magazine',
    category: 'blog',
    thumbnail: '/templates/blog-magazine.jpg',
    premium: false,
    popularity: 176,
    sections: [
      {
        id: 'hero-9',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Actualités & Insights',
          subtitle: 'Restez informé des dernières tendances',
          ctaText: 'Lire les articles',
          ctaLink: '#posts'
        }
      },
      {
        id: 'about-9',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'À propos du blog',
          description: 'Partage de connaissances, analyses et tendances de l\'industrie.',
          image: ''
        }
      }
    ]
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal & Elegant',
    description: 'Design épuré et élégant pour un maximum d\'impact',
    category: 'minimal',
    thumbnail: '/templates/minimal-elegant.jpg',
    premium: true,
    popularity: 389,
    sections: [
      {
        id: 'hero-10',
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          title: 'Simplicité & Élégance',
          subtitle: 'Moins c\'est plus',
          ctaText: 'Explorer',
          ctaLink: '#content'
        }
      },
      {
        id: 'about-10',
        type: 'about',
        order: 1,
        visible: true,
        content: {
          title: 'Notre Philosophie',
          description: 'La beauté réside dans la simplicité et l\'attention aux détails.',
          image: ''
        }
      },
      {
        id: 'contact-10',
        type: 'contact',
        order: 2,
        visible: true,
        content: {
          title: 'Contact',
          email: 'hello@minimal.com',
          formFields: ['name', 'email', 'message']
        }
      }
    ]
  }
];

// Function to seed templates to database
export async function seedTemplates(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('site_templates')
      .upsert(siteTemplates, { onConflict: 'id' });

    if (error) throw error;
    console.log('Templates seeded successfully');
    return data;
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
}
