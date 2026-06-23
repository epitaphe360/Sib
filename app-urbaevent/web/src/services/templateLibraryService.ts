/**
 * Template Library Service
 * Gère les templates de mini-sites pré-configurés
 */

import { supabase } from '../lib/supabase';
import type { SiteTemplate, SiteSection } from '../types/site-builder';

class TemplateLibraryService {
  /**
   * Récupérer tous les templates
   */
  async getAllTemplates(filters?: {
    category?: string;
    premium?: boolean;
  }): Promise<SiteTemplate[]> {
    try {
      let query = supabase
        .from('site_templates')
        .select('id, name, description, category, thumbnail, sections, premium, popularity')
        .order('popularity', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.premium !== undefined) {
        query = query.eq('premium', filters.premium);
      }

      const { data, error } = await query;
      if (error) {throw error;}

      return data || [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  /**
   * Récupérer un template par ID
   */
  async getTemplate(id: string): Promise<SiteTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('site_templates')
        .select('id, name, description, category, thumbnail, sections, premium, popularity')
        .eq('id', id)
        .single();

      if (error) {throw error;}
      return data;
    } catch (error) {
      console.error('Error loading template:', error);
      return null;
    }
  }

  /**
   * Créer un template personnalisé
   */
  async createTemplate(template: Omit<SiteTemplate, 'id'>): Promise<SiteTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('site_templates')
        .insert([template])
        .select()
        .single();

      if (error) {throw error;}
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un template
   */
  async updateTemplate(id: string, updates: Partial<SiteTemplate>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_templates')
        .update(updates)
        .eq('id', id);

      if (error) {throw error;}
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }

  /**
   * Incrémenter la popularité d'un template
   */
  async incrementPopularity(id: string): Promise<void> {
    try {
      const { data: template } = await supabase
        .from('site_templates')
        .select('popularity')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('site_templates')
          .update({ popularity: template.popularity + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing popularity:', error);
    }
  }

  /**
   * Cloner un template pour créer un nouveau site
   */
  async cloneTemplateToSite(templateId: string, userId: string, exhibitorId: string): Promise<string | null> {
    try {
      // Récupérer le template
      const template = await this.getTemplate(templateId);
      if (!template) {return null;}

      // Créer un nouveau mini-site basé sur le template
      const { data: newSite, error } = await supabase
        .from('mini_sites')
        .insert([{
          title: `${template.name} - Copy`,
          slug: `site-${Date.now()}`,
          sections: template.sections,
          seo: {
            title: template.name,
            description: template.description,
            keywords: [],
            ogImage: template.thumbnail,
            googleAnalyticsId: ''
          },
          published: false,
          exhibitorId,
          templateId: template.id
        }])
        .select()
        .single();

      if (error) {throw error;}

      // Incrémenter la popularité du template
      await this.incrementPopularity(templateId);

      return newSite.id;
    } catch (error) {
      console.error('Error cloning template:', error);
      return null;
    }
  }

  /**
   * Templates par défaut (si aucun en DB)
   */
  getDefaultTemplates(): SiteTemplate[] {
    return [
      {
        id: 'template-corporate-1',
        name: 'Corporate Professional',
        description: 'Template professionnel pour entreprises établies avec sections complètes',
        category: 'corporate',
        thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getCorporateSections(),
        premium: false,
        popularity: 250
      },
      {
        id: 'template-startup-1',
        name: 'Startup Moderne',
        description: 'Design moderne et dynamique pour startups innovantes',
        category: 'startup',
        thumbnail: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getStartupSections(),
        premium: false,
        popularity: 180
      },
      {
        id: 'template-ecommerce-1',
        name: 'E-commerce Pro',
        description: 'Template optimisé pour la vente en ligne avec galerie produits',
        category: 'ecommerce',
        thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getEcommerceSections(),
        premium: true,
        popularity: 320
      },
      {
        id: 'template-portfolio-1',
        name: 'Portfolio Créatif',
        description: 'Présentez vos projets et réalisations de manière élégante',
        category: 'portfolio',
        thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getPortfolioSections(),
        premium: false,
        popularity: 150
      },
      {
        id: 'template-landing-1',
        name: 'Landing Page Impact',
        description: 'Page d\'atterrissage avec fort taux de conversion',
        category: 'landing',
        thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getLandingSections(),
        premium: false,
        popularity: 200
      },
      {
        id: 'template-minimal-1',
        name: 'Minimal Clean',
        description: 'Design épuré et élégant pour un message clair',
        category: 'minimal',
        thumbnail: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=600',
        sections: this.getMinimalSections(),
        premium: false,
        popularity: 90
      }
    ];
  }

  private getCorporateSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Solutions d\'Excellence pour l\'Industrie Bâtiment',
          subtitle: 'Leader mondial en technologie bâtiment depuis 1995',
          backgroundImage: '',
          ctaText: 'Découvrir nos solutions',
          ctaLink: '#products'
        },
        order: 0,
        visible: true
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          title: 'Notre Expertise',
          description: 'Avec plus de 25 ans d\'expérience, nous accompagnons les bâtiments du monde entier dans leur transformation digitale et leur modernisation.',
          image: ''
        },
        order: 1,
        visible: true
      },
      {
        id: 'products-1',
        type: 'products',
        content: {
          title: 'Nos Solutions',
          items: []
        },
        order: 2,
        visible: true
      },
      {
        id: 'contact-1',
        type: 'contact',
        content: {
          title: 'Contactez-nous',
          email: 'Sib2026@urbacom.net',
          phone: '+212 6 88 50 05 00',
          address: '',
          formFields: ['name', 'email', 'company', 'message']
        },
        order: 3,
        visible: true
      }
    ];
  }

  private getStartupSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Innovation Bâtiment 🚀',
          subtitle: 'La prochaine génération de solutions BTP intelligentes',
          backgroundImage: '',
          ctaText: 'Rejoignez la révolution',
          ctaLink: '#about'
        },
        order: 0,
        visible: true
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          title: 'Notre Mission',
          description: 'Révolutionner l\'industrie du bâtiment avec l\'IA et l\'IoT pour créer des bâtiments plus efficaces et durables.',
          image: ''
        },
        order: 1,
        visible: true
      },
      {
        id: 'video-1',
        type: 'video',
        content: {
          title: 'Découvrez notre vision',
          videoUrl: '',
          autoplay: false
        },
        order: 2,
        visible: true
      }
    ];
  }

  private getEcommerceSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Équipements du Bâtiment Premium',
          subtitle: 'Livraison mondiale • Garantie 5 ans • Support 24/7',
          backgroundImage: '',
          ctaText: 'Voir le catalogue',
          ctaLink: '#products'
        },
        order: 0,
        visible: true
      },
      {
        id: 'products-1',
        type: 'products',
        content: {
          title: 'Nos Produits Phares',
          items: []
        },
        order: 1,
        visible: true
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        content: {
          title: 'Ils nous font confiance',
          items: []
        },
        order: 2,
        visible: true
      },
      {
        id: 'contact-1',
        type: 'contact',
        content: {
          title: 'Demandez un devis',
          email: 'sales@example.com',
          phone: '+212 5XX XXX XXX',
          address: '',
          formFields: ['name', 'email', 'phone', 'message']
        },
        order: 3,
        visible: true
      }
    ];
  }

  private getPortfolioSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Nos Réalisations',
          subtitle: 'Projets d\'excellence à travers le monde',
          backgroundImage: '',
          ctaText: 'Voir le portfolio',
          ctaLink: '#gallery'
        },
        order: 0,
        visible: true
      },
      {
        id: 'gallery-1',
        type: 'gallery',
        content: {
          title: 'Galerie de Projets',
          images: []
        },
        order: 1,
        visible: true
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          title: 'Notre Approche',
          description: 'Chaque projet est unique. Nous apportons expertise technique et créativité pour des solutions sur mesure.',
          image: ''
        },
        order: 2,
        visible: true
      }
    ];
  }

  private getLandingSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Transformez Votre Bâtiment en Hub Intelligent',
          subtitle: 'Augmentez l\'efficacité de 40% dès le premier mois',
          backgroundImage: '',
          ctaText: 'Demander une démo gratuite',
          ctaLink: '#contact'
        },
        order: 0,
        visible: true
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          title: 'Pourquoi Choisir Notre Solution ?',
          description: 'ROI prouvé • Installation en 48h • Formation incluse • Support dédié',
          image: ''
        },
        order: 1,
        visible: true
      },
      {
        id: 'contact-1',
        type: 'contact',
        content: {
          title: 'Démarrez Maintenant',
          email: 'demo@example.com',
          phone: '+212 5XX XXX XXX',
          address: '',
          formFields: ['name', 'email', 'company', 'phone']
        },
        order: 2,
        visible: true
      }
    ];
  }

  private getMinimalSections(): SiteSection[] {
    return [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Excellence Bâtiment',
          subtitle: 'Solutions simples, résultats extraordinaires',
          backgroundImage: '',
          ctaText: 'En savoir plus',
          ctaLink: '#about'
        },
        order: 0,
        visible: true
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          title: 'Notre Vision',
          description: 'L\'innovation au service de l\'efficacité. Des solutions élégantes pour des défis complexes.',
          image: ''
        },
        order: 1,
        visible: true
      },
      {
        id: 'contact-1',
        type: 'contact',
        content: {
          title: 'Contact',
          email: 'hello@example.com',
          phone: '',
          address: '',
          formFields: ['name', 'email', 'message']
        },
        order: 2,
        visible: true
      }
    ];
  }

  /**
   * Seed des templates par défaut dans la DB
   */
  async seedDefaultTemplates(): Promise<boolean> {
    try {
      const defaultTemplates = this.getDefaultTemplates();

      for (const template of defaultTemplates) {
        // Vérifier si le template existe déjà
        const { data: existing } = await supabase
          .from('site_templates')
          .select('id')
          .eq('id', template.id)
          .single();

        if (!existing) {
          await supabase
            .from('site_templates')
            .insert([template]);
        }
      }

      return true;
    } catch (error) {
      console.error('Error seeding templates:', error);
      return false;
    }
  }
}

export const templateLibraryService = new TemplateLibraryService();
export default templateLibraryService;
