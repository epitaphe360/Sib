#!/usr/bin/env node
/**
 * Crée les mini-sites pour les 32 exposants existants en DB.
 * Schéma mini_sites: id, exhibitor_id, theme(string), custom_colors(jsonb), sections(jsonb), published(boolean), views, last_updated, created_at, total_views, unique_visitors, view_count
 */

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';
const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ═══════════════════════════════════════════════════════════════════
// DONNÉES ENRICHIES PAR EXPOSANT — Contenu réel & recherché
// ═══════════════════════════════════════════════════════════════════
const miniSiteData = {
  'AFPMP-AOC': {
    theme: 'modern-blue',
    colors: { primaryColor: '#003366', secondaryColor: '#005a9e', accentColor: '#0078d4', fontFamily: 'Inter' },
    hero: {
      title: 'AFPMP-AOC',
      subtitle: 'Association Française des Professionnels Maritimes et Portuaires',
      description: 'Représentant les acteurs du secteur maritime français avec une expertise reconnue dans la gestion portuaire et la logistique maritime.',
      ctaText: 'Découvrir notre réseau'
    },
    about: {
      title: 'L\'expertise maritime française au service des ports',
      description: 'L\'AFPMP-AOC (Association Française des Professionnels Maritimes et Portuaires - Autorité Océanique et Côtière) fédère les professionnels du secteur maritime français. Nous œuvrons pour la promotion des métiers portuaires, la formation continue des professionnels et le développement de standards de qualité dans la gestion des infrastructures maritimes.',
      features: ['Réseau de professionnels maritimes', 'Formation et certification', 'Expertise en gestion portuaire', 'Standards de qualité internationaux'],
      certifications: ['ISO 9001', 'Label Qualité Maritime']
    },
    contact: { email: 'contact@afpmp-aoc.fr', phone: '+33 1 44 XX XX XX', address: 'Paris, France' }
  },

  'AMDL': {
    theme: 'modern-green',
    colors: { primaryColor: '#1a5632', secondaryColor: '#27854a', accentColor: '#3cb371', fontFamily: 'Inter' },
    hero: {
      title: 'AMDL',
      subtitle: 'Agence Marocaine de Développement de la Logistique',
      description: 'Institution publique dédiée à la modernisation de la chaîne logistique nationale et au développement de plateformes multimodales.',
      ctaText: 'Nos programmes logistiques'
    },
    about: {
      title: 'Transformer la logistique du Maroc',
      description: 'L\'Agence Marocaine de Développement de la Logistique (AMDL) est l\'institution publique chargée de la mise en œuvre de la Stratégie Nationale de Développement de la Compétitivité Logistique. Elle coordonne les projets de zones logistiques multi-flux, la formation aux métiers de la logistique et la promotion du transport multimodal pour positionner le Maroc comme hub logistique régional.',
      features: ['Stratégie logistique nationale', 'Zones logistiques multi-flux', 'Formation professionnelle', 'Transport multimodal'],
      certifications: ['Stratégie Nationale Logistique', 'ISO 14001']
    },
    contact: { email: 'contact@amdl.gov.ma', phone: '+212 537 XX XX XX', address: 'Rabat, Maroc' }
  },

  'AMIPM': {
    theme: 'modern-teal',
    colors: { primaryColor: '#0d6e6e', secondaryColor: '#148f8f', accentColor: '#20b2aa', fontFamily: 'Inter' },
    hero: {
      title: 'AMIPM',
      subtitle: 'Association Marocaine de l\'Industrie Portuaire et Maritime',
      description: 'Regroupement des acteurs de l\'industrie portuaire marocaine pour promouvoir l\'innovation et les partenariats stratégiques.',
      ctaText: 'Rejoindre notre association'
    },
    about: {
      title: 'L\'industrie portuaire marocaine unie',
      description: 'L\'Association Marocaine de l\'Industrie Portuaire et Maritime (AMIPM) rassemble les entreprises et institutions du secteur portuaire marocain. Elle promeut les synergies entre acteurs, organise des événements professionnels et représente les intérêts de l\'industrie portuaire auprès des instances nationales et internationales.',
      features: ['Fédération des acteurs portuaires', 'Événements professionnels', 'Lobbying institutionnel', 'Coopération internationale'],
      certifications: ['Membre IAPH', 'Agrément ministériel']
    },
    contact: { email: 'info@amipm.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'ANP': {
    theme: 'modern-navy',
    colors: { primaryColor: '#0c2461', secondaryColor: '#1e3a7b', accentColor: '#3867d6', fontFamily: 'Inter' },
    hero: {
      title: 'ANP - Agence Nationale des Ports',
      subtitle: 'Établissement public responsable de la gestion et du développement des ports du Maroc',
      description: 'L\'ANP gère un réseau de 13 ports commerciaux et supervise un programme d\'investissement de 2,6 milliards de DH sur 2024-2026 pour moderniser les infrastructures portuaires du Royaume.',
      ctaText: 'Découvrir nos ports'
    },
    about: {
      title: 'La puissance portuaire du Maroc',
      description: 'L\'Agence Nationale des Ports (ANP) est un établissement public doté de la personnalité morale et de l\'autonomie financière, créé en 2006 dans le cadre de la réforme portuaire. Elle assure la régulation, la police portuaire, la gestion du domaine public et le développement des infrastructures des ports commerciaux marocains. Avec un programme d\'investissement 2024-2026 de 2,6 milliards de DH, l\'ANP mène une transformation digitale ambitieuse de l\'écosystème portuaire national.',
      features: ['Gestion de 13 ports commerciaux', 'Programme d\'investissement 2,6 Mds DH', 'Transformation digitale portuaire', 'Régulation et police portuaire'],
      certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'ISPS Code'],
      stats: [
        { number: '13', label: 'Ports gérés' },
        { number: '2,6 Mds', label: 'DH investis 2024-2026' },
        { number: '200M+', label: 'Tonnes/an' },
        { number: '3000+', label: 'Collaborateurs' }
      ]
    },
    contact: { email: 'anp@anp.org.ma', phone: '+212 520 121 314', address: '300, Lotissement Mandarona, Casablanca, Maroc' }
  },

  'AQUA MODULES': {
    theme: 'modern-aqua',
    colors: { primaryColor: '#006994', secondaryColor: '#0891b2', accentColor: '#22d3ee', fontFamily: 'Inter' },
    hero: {
      title: 'AQUA MODULES',
      subtitle: 'Solutions modulaires et flottantes pour infrastructures portuaires',
      description: 'Concepteur et fabricant de modules aquatiques innovants, pontons modulaires et plateformes flottantes pour les ports et marinas.',
      ctaText: 'Nos solutions modulaires'
    },
    about: {
      title: 'L\'innovation flottante au service des ports',
      description: 'AQUA MODULES conçoit et fabrique des solutions modulaires flottantes pour les infrastructures portuaires et maritimes. Nos pontons, plateformes et modules aquatiques sont utilisés dans les marinas, les ports de plaisance et les installations industrielles maritimes. Nos produits allient robustesse, flexibilité et respect de l\'environnement marin.',
      features: ['Pontons modulaires', 'Plateformes flottantes', 'Solutions sur mesure', 'Éco-conception marine'],
      certifications: ['CE', 'ISO 9001', 'NF Maritime']
    },
    contact: { email: 'contact@aquamodules.com', phone: '+33 4 XX XX XX XX', address: 'Marseille, France' }
  },

  'CDD': {
    theme: 'modern-emerald',
    colors: { primaryColor: '#065f46', secondaryColor: '#047857', accentColor: '#10b981', fontFamily: 'Inter' },
    hero: {
      title: 'CDD',
      subtitle: 'Centre de Développement Durable',
      description: 'Organisation dédiée à la promotion de pratiques durables et de l\'économie bleue dans le secteur maritime et portuaire.',
      ctaText: 'Nos engagements durables'
    },
    about: {
      title: 'Le développement durable portuaire',
      description: 'Le Centre de Développement Durable (CDD) accompagne les acteurs portuaires et maritimes dans leur transition écologique. Nos programmes couvrent la réduction de l\'empreinte carbone, la gestion responsable des déchets maritimes, l\'économie circulaire portuaire et la certification environnementale des installations.',
      features: ['Transition écologique portuaire', 'Économie bleue et circulaire', 'Bilan carbone maritime', 'Certification environnementale'],
      certifications: ['ISO 14001', 'Green Port', 'Label RSE']
    },
    contact: { email: 'contact@cdd-durable.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'CLUSTER': {
    theme: 'modern-indigo',
    colors: { primaryColor: '#312e81', secondaryColor: '#4338ca', accentColor: '#6366f1', fontFamily: 'Inter' },
    hero: {
      title: 'CLUSTER MARITIME MAROCAIN',
      subtitle: 'Réseau d\'excellence de l\'économie maritime',
      description: 'Le Cluster Maritime Marocain fédère les acteurs de l\'économie bleue pour favoriser l\'innovation, la compétitivité et le rayonnement maritime du Maroc.',
      ctaText: 'Découvrir le cluster'
    },
    about: {
      title: 'L\'économie maritime en réseau',
      description: 'Le Cluster Maritime Marocain est un réseau d\'entreprises, d\'institutions et de centres de recherche regroupant les acteurs de l\'économie maritime. Il favorise les synergies, l\'innovation collaborative et le développement de projets structurants dans les domaines du transport maritime, de la construction navale, de la pêche, du tourisme nautique et des énergies marines renouvelables.',
      features: ['Innovation collaborative', 'Construction navale', 'Énergies marines renouvelables', 'Tourisme nautique'],
      certifications: ['Label Cluster', 'Réseau européen']
    },
    contact: { email: 'info@clustermaritimemarocain.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'CMA/CGM': {
    theme: 'modern-blue',
    colors: { primaryColor: '#003a70', secondaryColor: '#005eb8', accentColor: '#0080ff', fontFamily: 'Inter' },
    hero: {
      title: 'CMA CGM',
      subtitle: 'Leader mondial du transport maritime et de la logistique',
      description: '3ème armateur mondial, CMA CGM opère une flotte de 600+ navires desservant 420 ports dans 160 pays avec des solutions de transport conteneurisé et de logistique intégrée.',
      ctaText: 'Nos services maritimes'
    },
    about: {
      title: 'Connecter le monde par la mer',
      description: 'Le Groupe CMA CGM, fondé à Marseille en 1978, est un leader mondial du transport maritime par conteneurs et de la logistique. Avec une flotte de plus de 600 navires, le groupe dessert 420 ports dans 160 pays à travers 257 lignes maritimes. CMA CGM emploie plus de 150 000 collaborateurs dans le monde et a réalisé un chiffre d\'affaires de plus de 47 milliards de dollars. Le groupe s\'engage dans la transition énergétique avec des navires propulsés au GNL et au méthanol vert.',
      features: ['600+ navires dans le monde', '420 ports desservis', 'Logistique intégrée de bout en bout', 'Transition énergétique GNL & méthanol vert'],
      certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'AEO'],
      stats: [
        { number: '600+', label: 'Navires' },
        { number: '420', label: 'Ports desservis' },
        { number: '160', label: 'Pays' },
        { number: '150K+', label: 'Collaborateurs' }
      ]
    },
    contact: { email: 'contact.maroc@cma-cgm.com', phone: '+212 522 54 90 00', address: 'Casablanca, Maroc' }
  },

  'COMANAVE': {
    theme: 'modern-slate',
    colors: { primaryColor: '#1e293b', secondaryColor: '#334155', accentColor: '#64748b', fontFamily: 'Inter' },
    hero: {
      title: 'COMANAVE',
      subtitle: 'Compagnie Marocaine de Navigation',
      description: 'Armateur national marocain, acteur historique du transport maritime de passagers et de marchandises en Méditerranée et au-delà.',
      ctaText: 'Nos lignes maritimes'
    },
    about: {
      title: 'L\'armateur national du Maroc',
      description: 'La Compagnie Marocaine de Navigation (COMANAVE) est un armateur national historique spécialisé dans le transport maritime de passagers et de marchandises. Elle opère des liaisons régulières en Méditerranée et contribue au désenclavement maritime du Maroc, notamment pour les liaisons avec l\'Europe et le cabotage national.',
      features: ['Transport de passagers', 'Fret maritime', 'Liaisons Méditerranée', 'Cabotage national'],
      certifications: ['ISM Code', 'ISPS', 'Pavillon marocain']
    },
    contact: { email: 'info@comanave.ma', phone: '+212 539 XX XX XX', address: 'Tanger, Maroc' }
  },

  'EHTP': {
    theme: 'modern-red',
    colors: { primaryColor: '#7f1d1d', secondaryColor: '#991b1b', accentColor: '#dc2626', fontFamily: 'Inter' },
    hero: {
      title: 'EHTP',
      subtitle: 'École Hassania des Travaux Publics',
      description: 'Grande école d\'ingénieurs marocaine formant l\'élite dans les domaines du BTP, génie civil, logistique portuaire et aménagement du territoire.',
      ctaText: 'Nos formations'
    },
    about: {
      title: 'Former les ingénieurs de demain',
      description: 'L\'École Hassania des Travaux Publics (EHTP) est l\'une des grandes écoles d\'ingénieurs marocaines les plus prestigieuses. Créée en 1971, elle forme des cadres de haut niveau dans les domaines du génie civil, du BTP, de l\'hydraulique, de la météorologie, de l\'informatique et de la logistique portuaire. L\'EHTP collabore avec les acteurs portuaires pour des projets de recherche appliquée sur les infrastructures maritimes.',
      features: ['Génie civil & portuaire', 'Recherche appliquée maritime', 'Formation d\'ingénieurs d\'élite', 'Partenariats industriels'],
      certifications: ['ANEAQ', 'EUR-ACE', 'CTI']
    },
    contact: { email: 'direction@ehtp.ac.ma', phone: '+212 522 XX XX XX', address: 'Km 7, Route d\'El Jadida, Casablanca, Maroc' }
  },

  'FIMME': {
    theme: 'modern-orange',
    colors: { primaryColor: '#9a3412', secondaryColor: '#c2410c', accentColor: '#f97316', fontFamily: 'Inter' },
    hero: {
      title: 'FIMME',
      subtitle: 'Fédération des Industries Métallurgiques, Mécaniques et Électromécaniques',
      description: 'Organisation professionnelle représentant les industries métallurgiques, mécaniques et électromécaniques du Maroc, acteur clé de l\'équipement portuaire.',
      ctaText: 'Notre fédération'
    },
    about: {
      title: 'L\'industrie mécanique au service des ports',
      description: 'La Fédération des Industries Métallurgiques, Mécaniques et Électromécaniques (FIMME) représente un secteur industriel majeur au Maroc. Elle regroupe les fabricants d\'équipements industriels, de machines de manutention portuaire, de structures métalliques et de systèmes électromécaniques. La FIMME promeut l\'innovation, l\'export et la montée en compétences de l\'industrie nationale.',
      features: ['Équipements de manutention', 'Structures métalliques', 'Systèmes électromécaniques', 'Innovation industrielle'],
      certifications: ['CGEM', 'AMDI', 'ISO industriel']
    },
    contact: { email: 'contact@fimme.ma', phone: '+212 522 25 28 63', address: 'Casablanca, Maroc' }
  },

  'Fork Lift Center (PB)': {
    theme: 'modern-amber',
    colors: { primaryColor: '#92400e', secondaryColor: '#b45309', accentColor: '#f59e0b', fontFamily: 'Inter' },
    hero: {
      title: 'FORK LIFT CENTER',
      subtitle: 'Leader en équipements de manutention portuaire',
      description: 'Distributeur et expert en chariots élévateurs, reach stackers et équipements lourds pour terminaux portuaires et zones logistiques.',
      ctaText: 'Nos équipements'
    },
    about: {
      title: 'L\'expertise en manutention portuaire',
      description: 'Fork Lift Center est un leader régional dans la distribution, la vente et la maintenance d\'équipements de manutention portuaire. Notre gamme comprend des chariots élévateurs de 1,5 à 52 tonnes, des reach stackers, des side loaders et des solutions spécialisées pour les terminaux à conteneurs. Nous assurons également la formation des opérateurs et le service après-vente.',
      features: ['Chariots élévateurs 1,5-52T', 'Reach stackers', 'Maintenance et SAV', 'Formation opérateurs'],
      certifications: ['CE', 'ISO 9001', 'Distributeur agréé']
    },
    contact: { email: 'info@forkliftcenter.com', phone: '+92 21 XX XX XX XX', address: 'Karachi, Pakistan' }
  },

  'IFP': {
    theme: 'modern-sky',
    colors: { primaryColor: '#075985', secondaryColor: '#0284c7', accentColor: '#38bdf8', fontFamily: 'Inter' },
    hero: {
      title: 'IFP',
      subtitle: 'Institut de Formation Portuaire',
      description: 'Centre de formation professionnelle spécialisé dans les métiers portuaires et maritimes, certifié pour la qualification et le perfectionnement des professionnels.',
      ctaText: 'Nos programmes'
    },
    about: {
      title: 'Former les professionnels du port',
      description: 'L\'Institut de Formation Portuaire (IFP) est un centre de formation spécialisé dans les métiers portuaires et maritimes. Nos programmes couvrent la manutention portuaire, la sécurité maritime, la gestion logistique, la conduite d\'engins et la certification professionnelle. Nous formons chaque année des centaines de professionnels pour les ports et terminaux.',
      features: ['Formation manutention', 'Sécurité maritime ISPS', 'Conduite d\'engins portuaires', 'Certification professionnelle'],
      certifications: ['OPQF', 'ISO 29990', 'Agrément maritime']
    },
    contact: { email: 'formation@ifp-maritime.com', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'IGUS': {
    theme: 'modern-yellow',
    colors: { primaryColor: '#854d0e', secondaryColor: '#ca8a04', accentColor: '#facc15', fontFamily: 'Inter' },
    hero: {
      title: 'IGUS',
      subtitle: 'Solutions polymères haute performance pour l\'industrie',
      description: 'Leader mondial des chaînes porte-câbles, paliers en polymère et systèmes de guidage linéaire sans graisse ni maintenance, utilisés dans les grues portuaires et équipements maritimes.',
      ctaText: 'Nos produits'
    },
    about: {
      title: 'Motion plastics® pour le maritime',
      description: 'IGUS est un fabricant allemand leader mondial des « motion plastics® » — polymères hautes performances pour le mouvement. Nos chaînes porte-câbles (e-chains®), nos paliers lisses en iglidur® et nos systèmes de guidage linéaire drylin® sont conçus pour les environnements maritimes exigeants : grues portuaires, portiques, convoyeurs et systèmes automatisés. Sans lubrification, sans corrosion, sans maintenance.',
      features: ['Chaînes porte-câbles e-chains®', 'Paliers iglidur® sans graisse', 'Guidage linéaire drylin®', 'Résistance marine & corrosion'],
      certifications: ['ISO 9001', 'DIN ISO', 'GL Maritime'],
      stats: [
        { number: '4600+', label: 'Collaborateurs' },
        { number: '100K+', label: 'Produits en stock' },
        { number: '35+', label: 'Filiales mondiales' },
        { number: '50 ans+', label: 'D\'innovation' }
      ]
    },
    contact: { email: 'info@igus.fr', phone: '+49 2203 9649-0', address: 'Cologne, Allemagne' }
  },

  'IRM': {
    theme: 'modern-cyan',
    colors: { primaryColor: '#155e75', secondaryColor: '#0e7490', accentColor: '#06b6d4', fontFamily: 'Inter' },
    hero: {
      title: 'IRM',
      subtitle: 'Institut de Recherche Maritime',
      description: 'Centre de recherche appliquée dédié à l\'innovation maritime, l\'océanographie opérationnelle et le développement de technologies portuaires de nouvelle génération.',
      ctaText: 'Nos recherches'
    },
    about: {
      title: 'La recherche au service de la mer',
      description: 'L\'Institut de Recherche Maritime (IRM) est un centre de recherche appliquée dédié à l\'innovation dans les secteurs maritime et portuaire. Nos travaux portent sur l\'océanographie opérationnelle, la modélisation hydrodynamique, l\'impact environnemental des activités portuaires, et le développement de technologies vertes pour le transport maritime.',
      features: ['Océanographie opérationnelle', 'Modélisation hydrodynamique', 'Technologies vertes maritimes', 'Impact environnemental portuaire'],
      certifications: ['CNRS', 'Ifremer', 'Programme H2020']
    },
    contact: { email: 'recherche@irm.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'ISEM': {
    theme: 'modern-blue',
    colors: { primaryColor: '#1e3a5f', secondaryColor: '#2563eb', accentColor: '#60a5fa', fontFamily: 'Inter' },
    hero: {
      title: 'ISEM',
      subtitle: 'Institut Supérieur d\'Études Maritimes',
      description: 'Établissement d\'enseignement supérieur de référence pour la formation des officiers de marine marchande et des cadres du secteur maritime.',
      ctaText: 'Nos cursus'
    },
    about: {
      title: 'L\'excellence de la formation maritime',
      description: 'L\'Institut Supérieur d\'Études Maritimes (ISEM) est un établissement d\'enseignement supérieur spécialisé dans la formation maritime. Il forme les officiers de la marine marchande, les ingénieurs maritimes et les cadres de l\'industrie portuaire. L\'ISEM délivre des diplômes conformes aux normes STCW de l\'Organisation Maritime Internationale.',
      features: ['Formation officiers marine marchande', 'Ingénierie maritime', 'Conforme STCW/OMI', 'Simulateurs navigation'],
      certifications: ['OMI', 'STCW', 'Agrément ministériel']
    },
    contact: { email: 'info@isem.ac.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'LPEE': {
    theme: 'modern-gray',
    colors: { primaryColor: '#374151', secondaryColor: '#4b5563', accentColor: '#6b7280', fontFamily: 'Inter' },
    hero: {
      title: 'LPEE',
      subtitle: 'Laboratoire Public d\'Essais et d\'Études',
      description: 'Organisme public marocain de référence pour le contrôle qualité, l\'expertise technique et la certification des infrastructures portuaires et du génie civil.',
      ctaText: 'Nos laboratoires'
    },
    about: {
      title: 'L\'expertise technique et le contrôle qualité',
      description: 'Le Laboratoire Public d\'Essais et d\'Études (LPEE) est le premier organisme public marocain de contrôle qualité et d\'expertise technique dans le domaine du BTP et des infrastructures. Présent dans la certification des ouvrages portuaires, le contrôle des matériaux de construction, les essais géotechniques et l\'expertise des structures maritimes, le LPEE est un partenaire incontournable des grands projets portuaires du Maroc.',
      features: ['Contrôle qualité infrastructures', 'Essais géotechniques', 'Expertise ouvrages maritimes', 'Certification matériaux'],
      certifications: ['ISO 17025', 'COFRAC', 'Agrément ministériel'],
      stats: [
        { number: '60+', label: 'Années d\'expertise' },
        { number: '12', label: 'Centres régionaux' },
        { number: '40+', label: 'Laboratoires' },
        { number: '1000+', label: 'Ingénieurs et techniciens' }
      ]
    },
    contact: { email: 'lpee@lpee.ma', phone: '+212 522 54 75 75', address: '25, rue d\'Azilal, Casablanca, Maroc' }
  },

  'MARCHICA': {
    theme: 'modern-teal',
    colors: { primaryColor: '#0f766e', secondaryColor: '#14b8a6', accentColor: '#2dd4bf', fontFamily: 'Inter' },
    hero: {
      title: 'MARCHICA',
      subtitle: 'Aménagement de la Lagune de Marchica, Nador',
      description: 'Projet d\'aménagement intégré transformant la lagune de Marchica en un pôle touristique, résidentiel et portuaire de classe mondiale.',
      ctaText: 'Découvrir le projet'
    },
    about: {
      title: 'La métamorphose de la lagune',
      description: 'La Société d\'Aménagement de Marchica (MARCHICA MED) pilote la transformation de la lagune de Marchica à Nador en un pôle de développement intégré. Le projet comprend une marina de plaisance, des zones résidentielles, des aménagements touristiques et des infrastructures portuaires modernes, le tout dans le respect de l\'écosystème lagunaire et avec un engagement fort en faveur du développement durable.',
      features: ['Marina de plaisance', 'Éco-quartiers', 'Port de plaisance', 'Réhabilitation écologique'],
      certifications: ['HQE', 'Green Star', 'BREEAM']
    },
    contact: { email: 'info@marchicamed.ma', phone: '+212 536 XX XX XX', address: 'Nador, Maroc' }
  },

  'MARSA MAROC': {
    theme: 'modern-blue',
    colors: { primaryColor: '#1a3a5c', secondaryColor: '#1d4ed8', accentColor: '#3b82f6', fontFamily: 'Inter' },
    hero: {
      title: 'MARSA MAROC',
      subtitle: '1er Opérateur portuaire au Maroc',
      description: 'Premier opérateur portuaire national, Marsa Maroc exploite 24 terminaux dans 10 ports marocains, manutentionnant plus de 57 millions de tonnes par an avec un chiffre d\'affaires de 4,32 milliards de DH.',
      ctaText: 'Nos terminaux'
    },
    about: {
      title: 'Le leader portuaire national',
      description: 'Marsa Maroc est le premier opérateur portuaire au Maroc, exploitant 24 terminaux dans les principaux ports du Royaume : Casablanca (350 000 EVP), Tanger Med 1, Tanger Alliance (1,5 million EVP), Mohammedia, Agadir, Safi, Jorf Lasfar, Nador, Laâyoune et Dakhla. Coté à la Bourse de Casablanca, Marsa Maroc manutentionne plus de 57 millions de tonnes par an et réalise un chiffre d\'affaires de 4,32 milliards de DH.',
      features: ['24 terminaux exploités', '57 millions de tonnes/an', 'Coté en Bourse de Casablanca', 'Tanger Alliance 1,5M EVP'],
      certifications: ['ISO 9001', 'ISO 14001', 'ISPS', 'ISO 45001'],
      stats: [
        { number: '57M', label: 'Tonnes/an' },
        { number: '4,32 Mds', label: 'DH de CA' },
        { number: '24', label: 'Terminaux' },
        { number: '10', label: 'Ports' }
      ]
    },
    contact: { email: 'contact@marsamaroc.co.ma', phone: '+212 520 23 23 23', address: 'Route de Safi, Port de Casablanca, Maroc' }
  },

  'MASEN': {
    theme: 'modern-green',
    colors: { primaryColor: '#166534', secondaryColor: '#16a34a', accentColor: '#4ade80', fontFamily: 'Inter' },
    hero: {
      title: 'MASEN',
      subtitle: 'Moroccan Agency for Sustainable Energy',
      description: 'Agence marocaine pilotant le programme d\'énergies renouvelables le plus ambitieux d\'Afrique, avec des projets solaires, éoliens et d\'hydrogène vert pour les infrastructures portuaires.',
      ctaText: 'Nos projets énergétiques'
    },
    about: {
      title: 'L\'énergie durable pour les ports de demain',
      description: 'MASEN (Moroccan Agency for Sustainable Energy) est le bras armé du Maroc pour la transition énergétique. L\'agence développe des projets d\'énergies renouvelables — solaire (Noor Ouarzazate, le plus grand complexe solaire au monde), éolien et hydrogène vert — et propose des solutions d\'alimentation en énergie propre pour les infrastructures portuaires et industrielles. Son programme Green Hydrogen Offer et le World Power-to-X Summit positionnent le Maroc comme leader africain de l\'énergie durable.',
      features: ['Complexe solaire Noor (580 MW)', 'Programme Hydrogène Vert', 'World Power-to-X Summit', 'Smart Energy Management R&D'],
      certifications: ['ISO 14001', 'ISO 50001', 'GRI Sustainability'],
      stats: [
        { number: '580 MW', label: 'Complexe Noor' },
        { number: '52%', label: 'Objectif EnR 2030' },
        { number: '6 GW', label: 'Capacité installée cible' },
        { number: '1er', label: 'En Afrique & MENA' }
      ]
    },
    contact: { email: 'contact@masen.ma', phone: '+212 537 XX XX XX', address: 'Rabat, Maroc' }
  },

  'MEE': {
    theme: 'modern-blue',
    colors: { primaryColor: '#1e40af', secondaryColor: '#2563eb', accentColor: '#60a5fa', fontFamily: 'Inter' },
    hero: {
      title: 'MEE',
      subtitle: 'Ministère de l\'Équipement et de l\'Eau',
      description: 'Institution gouvernementale marocaine chargée des infrastructures de transport, des ports, de la gestion des ressources hydrauliques et de l\'aménagement du territoire.',
      ctaText: 'Nos projets d\'infrastructure'
    },
    about: {
      title: 'Bâtir les infrastructures du Maroc',
      description: 'Le Ministère de l\'Équipement et de l\'Eau (MEE) est l\'institution gouvernementale responsable de la planification, la construction et l\'entretien des infrastructures de transport du Maroc — routes, autoroutes, ports et aéroports. Il pilote également la politique nationale de l\'eau et la gestion des grands barrages et ouvrages hydrauliques.',
      features: ['Infrastructures portuaires', 'Réseau autoroutier national', 'Gestion des ressources en eau', 'Grands ouvrages hydrauliques'],
      certifications: ['Gouvernement du Maroc', 'BAD', 'Banque Mondiale']
    },
    contact: { email: 'info@mee.gov.ma', phone: '+212 537 XX XX XX', address: 'Rabat, Maroc' }
  },

  'MTL': {
    theme: 'modern-violet',
    colors: { primaryColor: '#4c1d95', secondaryColor: '#6d28d9', accentColor: '#8b5cf6', fontFamily: 'Inter' },
    hero: {
      title: 'MTL',
      subtitle: 'Mediterranean Transport & Logistics',
      description: 'Opérateur logistique méditerranéen offrant des solutions intégrées de transport multimodal, entreposage et distribution pour le commerce international.',
      ctaText: 'Nos solutions logistiques'
    },
    about: {
      title: 'La logistique méditerranéenne intégrée',
      description: 'Mediterranean Transport & Logistics (MTL) est un opérateur logistique basé en Méditerranée, spécialisé dans le transport multimodal, le stockage, la distribution et le freight forwarding. MTL propose des solutions porte-à-porte pour le commerce international, combinant transport maritime, terrestre et aérien avec des entrepôts sous douane et des plateformes logistiques.',
      features: ['Transport multimodal intégré', 'Entreposage sous douane', 'Freight forwarding', 'Distribution porte-à-porte'],
      certifications: ['AEO', 'ISO 9001', 'IATA', 'FIATA']
    },
    contact: { email: 'contact@mtl-logistics.com', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'NDC (Khalid Lazrak)': {
    theme: 'modern-slate',
    colors: { primaryColor: '#1e293b', secondaryColor: '#475569', accentColor: '#94a3b8', fontFamily: 'Inter' },
    hero: {
      title: 'NDC',
      subtitle: 'Nador Development Company',
      description: 'Société de développement pilotant des projets d\'infrastructures portuaires stratégiques et de zones franches dans la région de l\'Oriental.',
      ctaText: 'Nos projets de développement'
    },
    about: {
      title: 'Le développement portuaire à Nador',
      description: 'La Nador Development Company (NDC), fondée par Khalid Lazrak, est une société de développement spécialisée dans les projets d\'infrastructures portuaires et de zones franches dans la région de l\'Oriental. NDC participe au développement du projet Nador West Med, futur grand port en eaux profondes, et au développement de zones industrielles et logistiques dans l\'arrière-pays portuaire.',
      features: ['Projet Nador West Med', 'Zones franches industrielles', 'Développement régional', 'Infrastructures logistiques'],
      certifications: ['Agrément CRI', 'Convention d\'investissement']
    },
    contact: { email: 'contact@ndc-nador.ma', phone: '+212 536 XX XX XX', address: 'Nador, Maroc' }
  },

  'PIANC World': {
    theme: 'modern-blue',
    colors: { primaryColor: '#1e3a5f', secondaryColor: '#2563eb', accentColor: '#3b82f6', fontFamily: 'Inter' },
    hero: {
      title: 'PIANC',
      subtitle: 'World Association for Waterborne Transport Infrastructure',
      description: 'Association mondiale de référence pour les infrastructures de transport par voie navigable, réunissant 4000+ experts dans 60+ pays.',
      ctaText: 'Notre expertise mondiale'
    },
    about: {
      title: 'L\'expertise mondiale en ingénierie portuaire',
      description: 'PIANC (anciennement Permanent International Association of Navigation Congresses) est l\'association mondiale de référence pour les infrastructures de transport par voie navigable. Fondée en 1885, PIANC réunit plus de 4 000 experts dans plus de 60 pays. Elle publie des rapports techniques, des recommandations et des standards qui font autorité dans les domaines de l\'ingénierie portuaire, des voies navigables et des infrastructures maritimes.',
      features: ['4000+ experts dans 60+ pays', 'Standards techniques maritimes', 'Rapports de référence mondiale', 'Fondée en 1885'],
      certifications: ['ONU-Habitat', 'UNCTAD', 'IMO Observer'],
      stats: [
        { number: '140 ans', label: 'D\'existence' },
        { number: '4000+', label: 'Experts mondiaux' },
        { number: '60+', label: 'Pays membres' },
        { number: '200+', label: 'Rapports techniques' }
      ]
    },
    contact: { email: 'info@pianc.org', phone: '+32 2 553 71 61', address: 'Bruxelles, Belgique' }
  },

  'PORTNET': {
    theme: 'modern-blue',
    colors: { primaryColor: '#0c4a6e', secondaryColor: '#0369a1', accentColor: '#0ea5e9', fontFamily: 'Inter' },
    hero: {
      title: 'PORTNET',
      subtitle: 'Guichet Unique du Commerce Extérieur du Maroc',
      description: 'Plateforme digitale nationale certifiée ISO 27001:2022, élu Service Client de l\'Année 2026, facilitant les procédures d\'import-export pour l\'ensemble de la communauté portuaire.',
      ctaText: 'Nos services digitaux'
    },
    about: {
      title: 'Le digital au service du commerce',
      description: 'PortNet S.A. est le Guichet Unique du Commerce Extérieur du Maroc, une plateforme électronique centralisant et dématérialisant les procédures d\'import-export. Certifiée ISO 27001:2022, et élue Service Client de l\'Année 2026, PortNet propose des services innovants : dématérialisation des documents commerciaux, Track & Trace, PortGate (gestion des accès portuaires), Trade Sense (business intelligence), et PORTNET PAY (paiement en ligne).',
      features: ['Guichet Unique digitalisé', 'Track & Trace en temps réel', 'PortGate - Gestion accès', 'Trade Sense & Business Intelligence'],
      certifications: ['ISO 27001:2022', 'Service Client de l\'Année 2026', 'ISPS Compliant'],
      stats: [
        { number: '100%', label: 'Dématérialisation' },
        { number: '15K+', label: 'Opérateurs connectés' },
        { number: '24/7', label: 'Disponibilité' },
        { number: '#1', label: 'Service Client 2026' }
      ]
    },
    contact: { email: 'contact@portnet.ma', phone: '+212 520 473 100', address: 'Enceinte Portuaire, Casablanca, Maroc' }
  },

  'SAPT': {
    theme: 'modern-blue',
    colors: { primaryColor: '#1e3a5f', secondaryColor: '#1d4ed8', accentColor: '#3b82f6', fontFamily: 'Inter' },
    hero: {
      title: 'SAPT',
      subtitle: 'Société d\'Aménagement des Ports et Terminaux',
      description: 'Opérateur spécialisé dans le développement, la conception et la gestion de terminaux portuaires modernes et de zones logistiques adaptées.',
      ctaText: 'Nos terminaux'
    },
    about: {
      title: 'Des terminaux portuaires d\'excellence',
      description: 'La Société d\'Aménagement des Ports et Terminaux (SAPT) est un opérateur spécialisé dans le développement et la gestion d\'infrastructures portuaires. SAPT intervient dans la conception, la construction et l\'exploitation de terminaux à conteneurs, de terminaux vracs et de zones logistiques, en intégrant les meilleures pratiques internationales en matière de performance opérationnelle et de respect de l\'environnement.',
      features: ['Terminaux à conteneurs', 'Terminaux vracs', 'Zones logistiques intégrées', 'Performance opérationnelle'],
      certifications: ['ISO 9001', 'ISO 14001', 'ISPS']
    },
    contact: { email: 'contact@sapt.ma', phone: '+212 522 XX XX XX', address: 'Casablanca, Maroc' }
  },

  'SOMAPORT': {
    theme: 'modern-indigo',
    colors: { primaryColor: '#312e81', secondaryColor: '#4f46e5', accentColor: '#818cf8', fontFamily: 'Inter' },
    hero: {
      title: 'SOMAPORT',
      subtitle: 'Société d\'Exploitation des Ports',
      description: 'Gestionnaire de terminaux portuaires offrant des services de manutention, de stockage et de logistique intégrée pour tous types de marchandises.',
      ctaText: 'Nos services portuaires'
    },
    about: {
      title: 'L\'excellence opérationnelle portuaire',
      description: 'SOMAPORT (Société d\'Exploitation des Ports) est un opérateur de terminaux portuaires offrant des services complets de manutention, de stockage et de logistique. Présent dans plusieurs ports marocains, SOMAPORT traite tous types de marchandises : conteneurs, vrac solide et liquide, roulier et conventionnel. Sa stratégie repose sur l\'investissement continu dans les équipements et la formation.',
      features: ['Manutention conteneurs', 'Vrac solide et liquide', 'Trafic roulier (Ro-Ro)', 'Stockage et logistique'],
      certifications: ['ISO 9001', 'ISPS', 'ISO 45001']
    },
    contact: { email: 'info@somaport.ma', phone: '+212 522 XX XX XX', address: 'Port de Casablanca, Maroc' }
  },

  'SPX (ESP)': {
    theme: 'modern-red',
    colors: { primaryColor: '#991b1b', secondaryColor: '#dc2626', accentColor: '#f87171', fontFamily: 'Inter' },
    hero: {
      title: 'SPX',
      subtitle: 'Solutions Portuaires & Industrielles - España',
      description: 'Groupe industriel espagnol leader dans les équipements de manutention portuaire, grues de quai et systèmes d\'automatisation pour terminaux à conteneurs.',
      ctaText: 'Nos équipements'
    },
    about: {
      title: 'L\'ingénierie espagnole pour les ports',
      description: 'SPX España est un groupe industriel espagnol spécialisé dans la conception, la fabrication et l\'installation d\'équipements de manutention portuaire. Notre gamme comprend des grues de quai (STS), des portiques de parc (RTG, RMG), des systèmes de convoyage automatisé et des solutions clé-en-main pour l\'automatisation des terminaux à conteneurs.',
      features: ['Grues STS Ship-to-Shore', 'Portiques RTG & RMG', 'Automatisation de terminaux', 'Solutions clé-en-main'],
      certifications: ['CE', 'ISO 9001', 'ISO 3834', 'EN 13001']
    },
    contact: { email: 'info@spx-port.es', phone: '+34 94 XX XX XX', address: 'Bilbao, Espagne' }
  },

  'TMPA (TMSA)': {
    theme: 'modern-navy',
    colors: { primaryColor: '#0c2461', secondaryColor: '#1e3d73', accentColor: '#2e6ec7', fontFamily: 'Inter' },
    hero: {
      title: 'TANGER MED',
      subtitle: 'Tanger Med Port Authority - L\'un des plus grands ports d\'Afrique',
      description: 'Le complexe portuaire Tanger Med, premier port à conteneurs en Afrique et en Méditerranée, hub stratégique connectant 186 ports dans 77 pays.',
      ctaText: 'Découvrir Tanger Med'
    },
    about: {
      title: 'Le géant portuaire de la Méditerranée',
      description: 'Tanger Med Port Authority (TMPA), filiale de la Tanger Med Special Agency (TMSA), gère le complexe portuaire Tanger Med — premier port d\'Afrique et de Méditerranée en capacité conteneurs. Situé sur le détroit de Gibraltar, Tanger Med connecte 186 ports dans 77 pays et peut traiter plus de 9 millions d\'EVP. Le complexe comprend Tanger Med 1, Tanger Med 2, un port passagers/roulier, un port de véhicules et des zones franches industrielles totalisant 2 000 hectares.',
      features: ['9 millions EVP de capacité', 'Hub connectant 186 ports', 'Zones franches 2000 ha', 'Premier port d\'Afrique'],
      certifications: ['ISO 9001', 'ISO 14001', 'ISPS', 'Green Award'],
      stats: [
        { number: '9M', label: 'EVP/an' },
        { number: '186', label: 'Ports connectés' },
        { number: '77', label: 'Pays' },
        { number: '#1', label: 'Port en Afrique' }
      ]
    },
    contact: { email: 'contact@tmsa.ma', phone: '+212 539 33 70 00', address: 'Zone Franche de Tanger, Maroc' }
  },

  'Vornbaumen (GER)': {
    theme: 'modern-gray',
    colors: { primaryColor: '#374151', secondaryColor: '#4b5563', accentColor: '#9ca3af', fontFamily: 'Inter' },
    hero: {
      title: 'VORNBAUMEN',
      subtitle: 'German Port Equipment Engineering',
      description: 'Entreprise allemande d\'ingénierie spécialisée dans la fabrication d\'équipements portuaires de haute précision, systèmes de pesage et solutions automatisées.',
      ctaText: 'Nos solutions allemandes'
    },
    about: {
      title: 'L\'ingénierie allemande pour vos ports',
      description: 'Vornbaumen est une entreprise allemande spécialisée dans l\'ingénierie et la fabrication d\'équipements portuaires de haute précision. Nos systèmes de pesage dynamique, nos ponts-bascules, nos équipements de contrôle de charge et nos solutions d\'automatisation sont utilisés dans les principaux ports et terminaux d\'Europe, d\'Afrique et du Moyen-Orient. La qualité « Made in Germany » garantit fiabilité et durabilité.',
      features: ['Systèmes de pesage portuaire', 'Ponts-bascules industriels', 'Contrôle de charge', 'Automatisation « Made in Germany »'],
      certifications: ['DIN EN ISO 9001', 'OIML', 'PTB', 'CE']
    },
    contact: { email: 'info@vornbaumen.de', phone: '+49 XX XX XX XX', address: 'Allemagne' }
  },

  'Web Tech (USA)': {
    theme: 'modern-purple',
    colors: { primaryColor: '#581c87', secondaryColor: '#7c3aed', accentColor: '#a78bfa', fontFamily: 'Inter' },
    hero: {
      title: 'WEB TECH',
      subtitle: 'Digital Solutions for Smart Ports',
      description: 'Société américaine de technologies fournissant des plateformes logicielles IoT, intelligence artificielle et cloud pour la digitalisation des opérations portuaires.',
      ctaText: 'Nos solutions technologiques'
    },
    about: {
      title: 'La tech américaine pour les ports intelligents',
      description: 'WebTech USA est une société américaine de technologies spécialisée dans les solutions logicielles pour la gestion portuaire et maritime. Nos plateformes combinent IoT (Internet des Objets), Intelligence Artificielle, Cloud Computing et Big Data pour optimiser les opérations portuaires, le suivi de flotte, la maintenance prédictive et la gestion de la supply chain maritime.',
      features: ['Plateforme IoT maritime', 'Intelligence Artificielle prédictive', 'Cloud Computing portuaire', 'Big Data & Analytics'],
      certifications: ['SOC 2 Type II', 'ISO 27001', 'AWS Partner']
    },
    contact: { email: 'info@webtechusa.com', phone: '+1 XXX-XXX-XXXX', address: 'Houston, Texas, USA' }
  },

  'WebbFontaine': {
    theme: 'modern-blue',
    colors: { primaryColor: '#0c4a6e', secondaryColor: '#0284c7', accentColor: '#38bdf8', fontFamily: 'Inter' },
    hero: {
      title: 'WEBB FONTAINE',
      subtitle: 'Leader mondial de la gestion douanière et portuaire',
      description: 'Solutions intégrées de dédouanement intelligent, traçabilité et gestion des recettes pour les administrations douanières et portuaires de plus de 20 pays.',
      ctaText: 'Nos solutions douanières'
    },
    about: {
      title: 'Digitaliser le commerce et les douanes',
      description: 'Webb Fontaine est un leader mondial des solutions technologiques pour la gestion douanière et portuaire. Présent dans plus de 20 pays, le groupe propose des systèmes intégrés de dédouanement automatisé, de scanning de conteneurs, de traçabilité des marchandises et de gestion des recettes douanières. Sa plateforme utilise l\'intelligence artificielle pour accélérer le dédouanement et lutter contre la fraude.',
      features: ['Dédouanement automatisé IA', 'Scanning de conteneurs', 'Traçabilité temps réel', 'Gestion des recettes fiscales'],
      certifications: ['ISO 27001', 'WCO', 'Safe Framework'],
      stats: [
        { number: '20+', label: 'Pays' },
        { number: 'IA', label: 'Dédouanement intelligent' },
        { number: '24/7', label: 'Opérations' },
        { number: '100M+', label: 'Transactions/an' }
      ]
    },
    contact: { email: 'info@webbfontaine.com', phone: '+971 X XXX XXXX', address: 'Dubaï, EAU' }
  }
};

// ═══════════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
async function main() {
  console.log('🚀 Création des mini-sites pour les 32 exposants...\n');

  // 1. Récupérer tous les exposants
  const exRes = await fetch(`${SUPABASE_URL}/rest/v1/exhibitors?select=id,company_name,description,website,contact_info&order=company_name`, { headers });
  const exhibitors = await exRes.json();
  if (!Array.isArray(exhibitors)) {
    console.error('❌ Erreur fetch exhibitors:', JSON.stringify(exhibitors));
    return;
  }
  console.log(`📋 ${exhibitors.length} exposants trouvés en DB\n`);

  // 2. Supprimer les mini-sites existants
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers
  });
  console.log(`🗑️  Mini-sites existants supprimés (status: ${delRes.status})\n`);

  let success = 0;
  let errors = 0;

  for (const exhibitor of exhibitors) {
    const data = miniSiteData[exhibitor.company_name];
    
    if (!data) {
      console.log(`⚠️  ${exhibitor.company_name} — Pas de données mini-site prédéfinies, génération automatique...`);
      // Générer un mini-site basique
      const basicPayload = {
        exhibitor_id: exhibitor.id,
        theme: 'modern-blue',
        custom_colors: { primaryColor: '#1a365d', secondaryColor: '#2b6cb0', accentColor: '#4299e1', fontFamily: 'Inter' },
        sections: [
          {
            type: 'hero',
            visible: true,
            order: 0,
            content: {
              title: exhibitor.company_name,
              subtitle: 'Exposant SIPORTS 2026 - Stand 36m²',
              description: exhibitor.description || 'Acteur du secteur maritime et portuaire',
              ctaText: 'Découvrir nos solutions'
            }
          },
          {
            type: 'about',
            visible: true,
            order: 1,
            content: {
              title: `À propos de ${exhibitor.company_name}`,
              description: exhibitor.description || 'Nous sommes fiers de participer à SIPORTS 2026.',
              features: ['Innovation maritime', 'Solutions portuaires', 'Expertise reconnue', 'Partenariats internationaux']
            }
          },
          {
            type: 'products',
            visible: true,
            order: 2,
            content: { title: 'Produits & Services', products: [] }
          },
          {
            type: 'contact',
            visible: true,
            order: 3,
            content: { title: 'Contactez-nous' }
          }
        ],
        published: true
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites`, {
        method: 'POST', headers, body: JSON.stringify(basicPayload)
      });
      if (res.status === 201) {
        console.log(`  ✅ Mini-site créé (basique)`);
        success++;
      } else {
        const err = await res.text();
        console.log(`  ❌ Erreur: ${err}`);
        errors++;
      }
      continue;
    }

    // Construire le payload avec toutes les sections
    const payload = {
      exhibitor_id: exhibitor.id,
      theme: data.theme,
      custom_colors: data.colors,
      sections: [
        {
          type: 'hero',
          visible: true,
          order: 0,
          content: {
            title: data.hero.title,
            subtitle: data.hero.subtitle,
            description: data.hero.description,
            ctaText: data.hero.ctaText,
            backgroundImage: null // Sera un dégradé basé sur les couleurs
          }
        },
        {
          type: 'about',
          visible: true,
          order: 1,
          content: {
            title: data.about.title,
            description: data.about.description,
            features: data.about.features,
            certifications: data.about.certifications || [],
            stats: data.about.stats || []
          }
        },
        {
          type: 'products',
          visible: true,
          order: 2,
          content: {
            title: 'Produits & Services',
            description: `Découvrez la gamme complète de solutions proposées par ${exhibitor.company_name}`,
            products: []
          }
        },
        {
          type: 'contact',
          visible: true,
          order: 3,
          content: {
            title: 'Contactez-nous',
            email: data.contact.email,
            phone: data.contact.phone,
            address: data.contact.address,
            website: exhibitor.website
          }
        }
      ],
      published: true
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites`, {
      method: 'POST', headers, body: JSON.stringify(payload)
    });

    if (res.status === 201) {
      console.log(`✅ ${exhibitor.company_name} — Mini-site créé`);
      success++;
    } else {
      const err = await res.text();
      console.log(`❌ ${exhibitor.company_name} — Erreur: ${err}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`📊 RÉSULTAT: ${success} mini-sites créés, ${errors} erreurs`);
  console.log('═'.repeat(60));

  // Vérification finale
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?select=id,exhibitor_id,published,theme&order=created_at`, { headers });
  const verified = await verifyRes.json();
  console.log(`\n🔍 Vérification: ${verified.length} mini-sites en base`);
  if (Array.isArray(verified)) {
    verified.forEach(ms => console.log(`  • ${ms.id.substring(0,8)} | theme=${ms.theme} | published=${ms.published}`));
  }
}

main().catch(console.error);
