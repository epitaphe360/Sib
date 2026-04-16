import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Zap, Layers, BookOpen, TrendingUp, Eye,
  Download, LayoutGrid, Info, Save, CheckCircle2,
  AlertCircle, Loader2, ExternalLink, ChevronRight,
  Clock, Edit3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { useSalon } from '../../contexts/SalonContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
}

interface PageDef {
  slug: string;
  title: string;
  Icon: React.FC<{ className?: string }>;
  route: string;
  fields: FieldDef[];
}

// ─── Définition des pages et de leurs champs éditables ────────────────────────
const PAGES: PageDef[] = [
  {
    slug: 'presentation',
    title: 'Présentation',
    Icon: Globe,
    route: ROUTES.PRESENTATION,
    fields: [
      { key: 'hero_badge', label: 'Bandeau hero', type: 'text', placeholder: "20ème Édition — 40 ans d'excellence" },
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Salon International du Bâtiment' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Depuis 1986, le SIB est le rendez-vous incontournable...' },
      { key: 'hero_date', label: 'Hero — Date', type: 'text', placeholder: '25 – 29 Novembre 2026' },
      { key: 'hero_location', label: 'Hero — Lieu', type: 'text', placeholder: "Parc d'Exposition Mohammed VI, El Jadida" },
      { key: 'hero_hours', label: 'Hero — Horaires', type: 'text', placeholder: '9h00 – 19h00' },
      { key: 'stat_exposants', label: 'Nombre d\'exposants', type: 'text', placeholder: '500' },
      { key: 'stat_exposants_label', label: 'Stat exposants — Libellé', type: 'text', placeholder: 'Exposants' },
      { key: 'stat_exposants_sub', label: 'Stat exposants — Sous-texte', type: 'text', placeholder: '1 500 marques représentées' },
      { key: 'stat_visiteurs', label: 'Nombre de visiteurs', type: 'text', placeholder: '200 000' },
      { key: 'stat_visiteurs_label', label: 'Stat visiteurs — Libellé', type: 'text', placeholder: 'Visiteurs' },
      { key: 'stat_visiteurs_sub', label: 'Stat visiteurs — Sous-texte', type: 'text', placeholder: 'professionnels & grand public' },
      { key: 'stat_pays', label: 'Nombre de pays', type: 'text', placeholder: '50' },
      { key: 'stat_pays_label', label: 'Stat pays — Libellé', type: 'text', placeholder: 'Pays' },
      { key: 'stat_pays_sub', label: 'Stat pays — Sous-texte', type: 'text', placeholder: 'représentés' },
      { key: 'stat_surface', label: 'Surface d\'exposition', type: 'text', placeholder: '35 000 m²' },
      { key: 'stat_surface_label', label: 'Stat surface — Libellé', type: 'text', placeholder: 'Surface' },
      { key: 'stat_surface_sub', label: 'Stat surface — Sous-texte', type: 'text', placeholder: "d'exposition" },
      { key: 'about_title', label: 'Titre section À propos', type: 'text', placeholder: 'Le Salon International du Bâtiment' },
      { key: 'about_text', label: 'Texte À propos (remplace les paragraphes de présentation)', type: 'textarea', placeholder: "Le Salon International du Bâtiment – SIB revient pour sa 20ᵉ édition, célébrant ainsi ses 40 années d'existence. Ce salon incontournable se déroulera du 25 au 29 novembre 2026 au Parc d'Exposition Mohammed VI d'El Jadida.\n\nFondé en 1986, le SIB s'est imposé comme le rendez-vous biennal de référence du secteur du bâtiment au Maroc et en Afrique. Il réunit 600 exposants et 1 500 marques internationales autour d'un même objectif : construire l'avenir. Avec 200 000 visiteurs professionnels, 50 pays représentés, 300 rencontres B2B planifiées via URBA EVENT et 35 000 m² d'exposition, le SIB s'impose comme le hub africain de la construction et de l'innovation.\n\nOrganisé par le Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville et l'Agence Marocaine de Développement des Investissements et des Exportations – AMDIE, et co-organisé par la Fédération des Industries des Matériaux de Construction – FMC et la Fédération Nationale du Bâtiment et des Travaux Publics – FNBTP, URBACOM en assure la gestion déléguée depuis 2006.\n\nAu-delà de sa portée nationale, le SIB s'impose aujourd'hui comme le grand rendez-vous africain du bâtiment et des matériaux de construction, un espace où convergent les expertises du continent. Le salon propose 2 espaces de démonstration, 30 applications techniques, 20 conférences animées par des experts marocains et internationaux, ainsi que des espaces thématiques : SIB Academy, SIB Recrutement, SIB TV, Espace B2B et Espace Démonstration." },
      { key: 'about_read_more', label: 'Bouton en savoir plus', type: 'text', placeholder: 'Savoir plus' },
      { key: 'about_read_less', label: 'Bouton réduire', type: 'text', placeholder: 'Réduire' },
      { key: 'image_badge_date', label: 'Image — Badge date', type: 'text', placeholder: '25-29 Novembre 2026' },
      { key: 'image_location_label', label: 'Image — Libellé emplacement', type: 'text', placeholder: 'Emplacement' },
      { key: 'image_location_value', label: 'Image — Valeur emplacement', type: 'text', placeholder: "Parc d'Exposition Mohammed VI - EL JADIDA" },
      { key: 'image_date_label', label: 'Image — Libellé date', type: 'text', placeholder: 'Date' },
      { key: 'image_date_value', label: 'Image — Valeur date', type: 'text', placeholder: 'Du 25 au 29 Novembre 2026' },
      { key: 'free_entry_title', label: 'Section entrée — Titre', type: 'text', placeholder: 'Entrée Gratuite' },
      { key: 'free_entry_text', label: 'Section entrée — Texte', type: 'textarea', placeholder: "L'accès au salon est entièrement gratuit. Un badge électronique est requis et peut être obtenu en ligne ou sur place." },
      { key: 'free_entry_cta', label: 'Section entrée — Bouton', type: 'text', placeholder: 'Obtenez votre badge' },
      { key: 'organizers_title', label: 'Section organisateurs — Titre', type: 'text', placeholder: 'Organisateurs' },
      { key: 'brochure_title', label: 'Section brochure — Titre', type: 'text', placeholder: 'Téléchargez la brochure SIB 2026' },
      { key: 'brochure_text', label: 'Section brochure — Texte', type: 'textarea', placeholder: 'Retrouvez toutes les informations essentielles sur le salon, le programme et les modalités de participation.' },
      { key: 'brochure_cta', label: 'Section brochure — Bouton', type: 'text', placeholder: 'Brochure SIB 2026 (PDF)' },
      { key: 'brochure_url', label: 'Section brochure — URL PDF', type: 'text', placeholder: 'https://sib.ma/backend/uploads/Brochure_SIB_2026_F_3175004ace.pdf' },
      { key: 'org_1_name', label: 'Organisateur 1 — Nom', type: 'text', placeholder: 'Ministère MUAT' },
      { key: 'org_1_role', label: 'Organisateur 1 — Rôle', type: 'text', placeholder: 'Organisateur' },
      { key: 'org_1_desc', label: 'Organisateur 1 — Description', type: 'textarea', placeholder: "Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville" },
      { key: 'org_2_name', label: 'Organisateur 2 — Nom', type: 'text', placeholder: 'AMDIE' },
      { key: 'org_2_role', label: 'Organisateur 2 — Rôle', type: 'text', placeholder: 'Organisateur' },
      { key: 'org_2_desc', label: 'Organisateur 2 — Description', type: 'textarea', placeholder: 'Agence Marocaine de Développement des Investissements et des Exportations' },
      { key: 'org_3_name', label: 'Organisateur 3 — Nom', type: 'text', placeholder: 'FMC' },
      { key: 'org_3_role', label: 'Organisateur 3 — Rôle', type: 'text', placeholder: 'Co-organisateur' },
      { key: 'org_3_desc', label: 'Organisateur 3 — Description', type: 'textarea', placeholder: 'Fédération des Industries des Matériaux de Construction' },
      { key: 'org_4_name', label: 'Organisateur 4 — Nom', type: 'text', placeholder: 'FNBTP' },
      { key: 'org_4_role', label: 'Organisateur 4 — Rôle', type: 'text', placeholder: 'Co-organisateur' },
      { key: 'org_4_desc', label: 'Organisateur 4 — Description', type: 'textarea', placeholder: 'Fédération Nationale du Bâtiment et des Travaux Publics' },
      { key: 'org_5_name', label: 'Organisateur 5 — Nom', type: 'text', placeholder: 'URBACOM' },
      { key: 'org_5_role', label: 'Organisateur 5 — Rôle', type: 'text', placeholder: 'Organisateur délégué' },
      { key: 'org_5_desc', label: 'Organisateur 5 — Description', type: 'textarea', placeholder: '1ʳᵉ agence conseil en communication et événementiel, gestion déléguée depuis 2006' },
    ],
  },
  {
    slug: 'nouveautes',
    title: 'Nouveautés',
    Icon: Zap,
    route: ROUTES.NOUVEAUTES,
    fields: [
      { key: 'hero_badge', label: 'Badge hero', type: 'text', placeholder: 'SIB 2026' },
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Nouveautés' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Découvrez les innovations et les changements majeurs...' },
      { key: 'item_1_title', label: 'Nouveauté 1 — Titre', type: 'text' },
      { key: 'item_1_desc', label: 'Nouveauté 1 — Description', type: 'textarea' },
      { key: 'item_2_title', label: 'Nouveauté 2 — Titre', type: 'text' },
      { key: 'item_2_desc', label: 'Nouveauté 2 — Description', type: 'textarea' },
      { key: 'item_3_title', label: 'Nouveauté 3 — Titre', type: 'text' },
      { key: 'item_3_desc', label: 'Nouveauté 3 — Description', type: 'textarea' },
      { key: 'item_4_title', label: 'Nouveauté 4 — Titre', type: 'text' },
      { key: 'item_4_desc', label: 'Nouveauté 4 — Description', type: 'textarea' },
      { key: 'item_5_title', label: 'Nouveauté 5 — Titre', type: 'text' },
      { key: 'item_5_desc', label: 'Nouveauté 5 — Description', type: 'textarea' },
      { key: 'item_6_title', label: 'Nouveauté 6 — Titre', type: 'text' },
      { key: 'item_6_desc', label: 'Nouveauté 6 — Description', type: 'textarea' },
      { key: 'item_7_title', label: 'Nouveauté 7 — Titre', type: 'text' },
      { key: 'item_7_desc', label: 'Nouveauté 7 — Description', type: 'textarea' },
      { key: 'items_json', label: 'Nouveautés JSON (optionnel)', type: 'textarea', placeholder: '[{"title":"...","desc":"...","color":"bg-amber-50 text-amber-600"}]' },
    ],
  },
  {
    slug: 'secteurs-activites',
    title: 'Secteurs d\'Activités',
    Icon: Layers,
    route: ROUTES.SECTEURS_ACTIVITES,
    fields: [
      { key: 'hero_badge', label: 'Badge hero', type: 'text', placeholder: "10 secteurs d'activité" },
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Secteurs d\'Activités' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Le SIB couvre l\'ensemble de la chaîne de valeur du bâtiment...' },
      { key: 'search_placeholder', label: 'Placeholder recherche', type: 'text', placeholder: 'Rechercher un secteur ou une sous-catégorie...' },
      { key: 'empty_text', label: 'Texte aucun résultat', type: 'text', placeholder: 'Aucun secteur ne correspond à votre recherche.' },
      { key: 'secteurs_json', label: 'Secteurs JSON (optionnel)', type: 'textarea', placeholder: '[{"id":1,"name":"...","subcategories":["...","..."]}]' },
    ],
  },
  {
    slug: 'editions',
    title: 'Éditions',
    Icon: BookOpen,
    route: ROUTES.EDITIONS,
    fields: [
      { key: 'hero_badge', label: 'Badge hero', type: 'text', placeholder: "40 ans d'histoire" },
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Nos Éditions' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Depuis 1986, le SIB accompagne l\'essor du secteur du bâtiment...' },
      { key: 'timeline_json', label: 'Timeline JSON (optionnel)', type: 'textarea', placeholder: '[{"year":2026,"edition":"20ème","dates":"...","lieu":"..."}]' },
    ],
  },
  {
    slug: 'pourquoi-exposer',
    title: 'Pourquoi Exposer',
    Icon: TrendingUp,
    route: ROUTES.POURQUOI_EXPOSER,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Pourquoi Exposer au SIB ?' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Rejoignez le plus grand salon du bâtiment au Maroc...' },
      { key: 'hero_cta', label: 'Bouton hero', type: 'text', placeholder: 'Réservez votre stand' },
      { key: 'reasons_title', label: 'Titre section raisons', type: 'text', placeholder: "6 raisons d'exposer" },
      { key: 'stats_json', label: 'Stats JSON (optionnel)', type: 'textarea', placeholder: '[{"value":"600+","label":"Exposants"}]' },
      { key: 'arg_1_title', label: 'Argument 1 — Titre', type: 'text' },
      { key: 'arg_1_desc', label: 'Argument 1 — Description', type: 'textarea' },
      { key: 'arg_2_title', label: 'Argument 2 — Titre', type: 'text' },
      { key: 'arg_2_desc', label: 'Argument 2 — Description', type: 'textarea' },
      { key: 'arg_3_title', label: 'Argument 3 — Titre', type: 'text' },
      { key: 'arg_3_desc', label: 'Argument 3 — Description', type: 'textarea' },
      { key: 'arg_4_title', label: 'Argument 4 — Titre', type: 'text' },
      { key: 'arg_4_desc', label: 'Argument 4 — Description', type: 'textarea' },
      { key: 'arg_5_title', label: 'Argument 5 — Titre', type: 'text' },
      { key: 'arg_5_desc', label: 'Argument 5 — Description', type: 'textarea' },
      { key: 'arg_6_title', label: 'Argument 6 — Titre', type: 'text' },
      { key: 'arg_6_desc', label: 'Argument 6 — Description', type: 'textarea' },
      { key: 'sectors_title', label: 'Titre section secteurs', type: 'text', placeholder: 'Secteurs représentés' },
      { key: 'sectors_json', label: 'Secteurs (liste JSON optionnelle)', type: 'textarea', placeholder: '["Gros Œuvre & Structure","Menuiserie & Fermeture"]' },
      { key: 'cta_title', label: 'Titre CTA bas de page', type: 'text', placeholder: 'Prêt à exposer ?' },
      { key: 'cta_text', label: 'Texte CTA bas de page', type: 'textarea', placeholder: 'Réservez votre stand dès maintenant...' },
      { key: 'cta_button', label: 'Bouton CTA bas de page', type: 'text', placeholder: 'Demander un devis' },
    ],
  },
  {
    slug: 'pourquoi-visiter',
    title: 'Pourquoi Visiter',
    Icon: Eye,
    route: ROUTES.POURQUOI_VISITER,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Pourquoi Visiter le SIB ?' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: '5 jours pour découvrir, apprendre et connecter...' },
      { key: 'hero_cta', label: 'Bouton hero', type: 'text', placeholder: 'Obtenez votre badge gratuit' },
      { key: 'reasons_title', label: 'Titre section raisons', type: 'text', placeholder: '6 bonnes raisons de visiter' },
      { key: 'arg_1_title', label: 'Raison 1 — Titre', type: 'text' },
      { key: 'arg_1_desc', label: 'Raison 1 — Description', type: 'textarea' },
      { key: 'arg_2_title', label: 'Raison 2 — Titre', type: 'text' },
      { key: 'arg_2_desc', label: 'Raison 2 — Description', type: 'textarea' },
      { key: 'arg_3_title', label: 'Raison 3 — Titre', type: 'text' },
      { key: 'arg_3_desc', label: 'Raison 3 — Description', type: 'textarea' },
      { key: 'arg_4_title', label: 'Raison 4 — Titre', type: 'text' },
      { key: 'arg_4_desc', label: 'Raison 4 — Description', type: 'textarea' },
      { key: 'arg_5_title', label: 'Raison 5 — Titre', type: 'text' },
      { key: 'arg_5_desc', label: 'Raison 5 — Description', type: 'textarea' },
      { key: 'arg_6_title', label: 'Raison 6 — Titre', type: 'text' },
      { key: 'arg_6_desc', label: 'Raison 6 — Description', type: 'textarea' },
      { key: 'infos_title', label: 'Titre section infos', type: 'text', placeholder: 'Infos Pratiques' },
      { key: 'infos_json', label: 'Infos pratiques JSON (optionnel)', type: 'textarea', placeholder: '[{"label":"Dates","value":"25 – 29 Novembre 2026"}]' },
      { key: 'transport_title', label: 'Titre section transport', type: 'text', placeholder: "Comment s'y rendre ?" },
      { key: 'transport_json', label: 'Transport JSON (optionnel)', type: 'textarea', placeholder: '[{"title":"Par navettes","desc":"..."}]' },
      { key: 'cta_title', label: 'Titre CTA bas de page', type: 'text', placeholder: 'Prêt à visiter ?' },
      { key: 'cta_text', label: 'Texte CTA bas de page', type: 'textarea', placeholder: "L'entrée est gratuite..." },
      { key: 'cta_button', label: 'Bouton CTA bas de page', type: 'text', placeholder: "S'inscrire gratuitement" },
    ],
  },
  {
    slug: 'telechargements',
    title: 'Téléchargements',
    Icon: Download,
    route: ROUTES.TELECHARGEMENTS,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Téléchargements' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Documents officiels, catalogues et bilans des éditions passées.' },
      { key: 'documents_json', label: 'Documents JSON (optionnel)', type: 'textarea', placeholder: '[{"year":"2026","label":"SIB 2026","docs":[{"name":"Brochure","url":"https://..."}]}]' },
    ],
  },
  {
    slug: 'espaces-sib',
    title: 'Espaces SIB',
    Icon: LayoutGrid,
    route: ROUTES.ESPACES_SIB,
    fields: [
      { key: 'hero_badge', label: 'Badge hero', type: 'text', placeholder: '5 espaces dédiés' },
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Espaces SIB' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Parce que le SIB ne se résume pas qu\'aux stands d\'exposition...' },
      { key: 'espace_1_title', label: 'Espace 1 — Titre', type: 'text' },
      { key: 'espace_1_desc', label: 'Espace 1 — Description', type: 'textarea' },
      { key: 'espace_2_title', label: 'Espace 2 — Titre', type: 'text' },
      { key: 'espace_2_desc', label: 'Espace 2 — Description', type: 'textarea' },
      { key: 'espace_3_title', label: 'Espace 3 — Titre', type: 'text' },
      { key: 'espace_3_desc', label: 'Espace 3 — Description', type: 'textarea' },
      { key: 'espace_4_title', label: 'Espace 4 — Titre', type: 'text' },
      { key: 'espace_4_desc', label: 'Espace 4 — Description', type: 'textarea' },
      { key: 'espace_5_title', label: 'Espace 5 — Titre', type: 'text' },
      { key: 'espace_5_desc', label: 'Espace 5 — Description', type: 'textarea' },
      { key: 'espaces_json', label: 'Espaces JSON (optionnel)', type: 'textarea', placeholder: '[{"title":"...","description":"..."}]' },
      { key: 'cta_title', label: 'Titre CTA', type: 'text', placeholder: 'Intéressé par un espace ?' },
      { key: 'cta_text', label: 'Texte CTA', type: 'textarea', placeholder: 'Contactez-nous pour en savoir plus...' },
      { key: 'cta_button', label: 'Bouton CTA', type: 'text', placeholder: 'Contactez-nous' },
      { key: 'cta_url', label: 'Lien CTA', type: 'text', placeholder: '/contact' },
    ],
  },
  {
    slug: 'infos-pratiques',
    title: 'Infos Pratiques',
    Icon: Info,
    route: ROUTES.INFOS_PRATIQUES,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Infos Pratiques' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Tout ce qu\'il faut savoir pour préparer votre visite...' },
      { key: 'lieu_title', label: 'Titre section lieu', type: 'text', placeholder: 'Parc d\'Exposition Mohammed VI' },
      { key: 'lieu_adresse', label: 'Adresse du lieu', type: 'textarea', placeholder: 'Route Nationale 1 vers Azemmour, Région Casablanca - Settat, 24000 — EL JADIDA' },
      { key: 'lieu_context', label: 'Contexte section lieu', type: 'textarea', placeholder: 'Implanté au cœur du Pôle urbain Mazagan (PUMA)...' },
      { key: 'horaires_title', label: 'Titre section horaires', type: 'text', placeholder: 'Horaires' },
      { key: 'horaires_json', label: 'Horaires JSON (optionnel)', type: 'textarea', placeholder: '[{"jour":"Mardi 25 Novembre","heures":"9h00 – 19h00"}]' },
      { key: 'tarifs_title', label: 'Titre section tarifs', type: 'text', placeholder: 'Tarifs' },
      { key: 'tarifs_intro', label: 'Texte introduction tarifs', type: 'textarea', placeholder: 'L\'entrée est gratuite tout au long des 5 jours d\'exposition...' },
      { key: 'tarifs_bullets_json', label: 'Tarifs bullets JSON (optionnel)', type: 'textarea', placeholder: '["Badge électronique...","Invitation...","Carte de visite..."]' },
      { key: 'tarifs_cta', label: 'Bouton section tarifs', type: 'text', placeholder: 'Obtenir mon badge gratuit' },
      { key: 'venir_title', label: 'Titre section transport', type: 'text', placeholder: 'Comment venir ?' },
      { key: 'venir_json', label: 'Sections transport JSON (optionnel)', type: 'textarea', placeholder: '[{"title":"Par Navettes SIB","desc":"...","note":"..."}]' },
      { key: 'hebergement_title', label: 'Titre section hébergement', type: 'text', placeholder: 'Hébergement' },
      { key: 'navette_exposants', label: 'Navettes exposants', type: 'text', placeholder: 'Départ 08h30, Retour 19h00' },
      { key: 'navette_visiteurs', label: 'Navettes visiteurs', type: 'text', placeholder: 'Départs 08h30 et 10h30 — Retours 17h30 et 18h30' },
      { key: 'hebergement_text', label: 'Texte hébergement', type: 'textarea', placeholder: 'Les hôtels recommandés à proximité...' },
      { key: 'hebergement_cta', label: 'Bouton section hébergement', type: 'text', placeholder: 'Voir les hébergements' },
    ],
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ContentManagement() {
  const { currentSalon } = useSalon();
  const [selectedPage, setSelectedPage] = useState<PageDef | null>(null);
  const [allContents, setAllContents] = useState<Record<string, Record<string, string>>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [updatedDates, setUpdatedDates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getDefaultValuesForPage = useCallback((page: PageDef): Record<string, string> => {
    return page.fields.reduce((acc, field) => {
      acc[field.key] = field.placeholder ?? '';
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const getPrefilledValuesForPage = useCallback((page: PageDef): Record<string, string> => {
    const defaults = getDefaultValuesForPage(page);
    const persisted = allContents[page.slug] ?? {};
    return page.fields.reduce((acc, field) => {
      const persistedValue = persisted[field.key];
      acc[field.key] = typeof persistedValue === 'string' && persistedValue.length > 0
        ? persistedValue
        : defaults[field.key] ?? '';
      return acc;
    }, {} as Record<string, string>);
  }, [allContents, getDefaultValuesForPage]);

  // Chargement initial de tous les contenus
  useEffect(() => {
    (async () => {
      try {
        let query = supabase
          .from('page_contents')
          .select('page_slug, content, updated_at');
        if (currentSalon) {
          if (currentSalon.is_default) {
            query = query.or(`salon_id.eq.${currentSalon.id},salon_id.is.null`);
          } else {
            query = query.eq('salon_id', currentSalon.id);
          }
        }
        const { data } = await query;
        if (data) {
          const contentMap: Record<string, Record<string, string>> = {};
          const dateMap: Record<string, string> = {};
          data.forEach((row: any) => {
            contentMap[row.page_slug] = row.content ?? {};
            dateMap[row.page_slug] = row.updated_at;
          });
          setAllContents(contentMap);
          setUpdatedDates(dateMap);
        }
      } catch { /* silently fail */ }
      setIsLoading(false);
    })();
  }, [currentSalon]);

  const handlePageSelect = useCallback((page: PageDef) => {
    setSelectedPage(page);
    setEditValues(getPrefilledValuesForPage(page));
    setSaveStatus('idle');
  }, [getPrefilledValuesForPage]);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!selectedPage) {return;}
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const defaults = getDefaultValuesForPage(selectedPage);
      const normalizedContent = Object.fromEntries(
        Object.entries(editValues).filter(([key, value]) => {
          const trimmed = (value ?? '').trim();
          const defaultValue = (defaults[key] ?? '').trim();
          return trimmed !== '' && trimmed !== defaultValue;
        })
      );

      const { data: { user } } = await supabase.auth.getUser();
      const upsertPayload: Record<string, unknown> = {
        page_slug: selectedPage.slug,
        content: normalizedContent,
        updated_by: user?.id ?? null,
        ...(currentSalon ? { salon_id: currentSalon.id } : {}),
      };
      const conflictCol = currentSalon ? 'page_slug,salon_id' : 'page_slug';
      const { error } = await supabase.from('page_contents').upsert(
        upsertPayload,
        { onConflict: conflictCol }
      );
      if (error) {throw error;}
      setAllContents((prev) => ({ ...prev, [selectedPage.slug]: normalizedContent }));
      setUpdatedDates((prev) => ({ ...prev, [selectedPage.slug]: new Date().toISOString() }));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!selectedPage) {return;}
    setEditValues(getPrefilledValuesForPage(selectedPage));
    setSaveStatus('idle');
  };

  const formatDate = (iso: string) =>
    iso
      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
      : null;

  const hasCustomContent = (slug: string) =>
    Object.values(allContents[slug] ?? {}).some((v) => v?.trim() !== '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Modifiez le contenu des pages publiques du site SIB directement depuis l'interface
          d'administration. Les modifications sont visibles immédiatement après sauvegarde.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 text-sib-navy animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panneau gauche — liste des pages */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Pages du site ({PAGES.length})
                </p>
              </div>
              <ul className="divide-y divide-gray-50">
                {PAGES.map((page) => {
                  const isSelected = selectedPage?.slug === page.slug;
                  const dated = updatedDates[page.slug];
                  const hasContent = hasCustomContent(page.slug);
                  return (
                    <li key={page.slug}>
                      <button
                        onClick={() => handlePageSelect(page)}
                        className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-sib-navy' : 'border-l-4 border-transparent'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-sib-navy' : 'bg-gray-100'}`}>
                          <page.Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${isSelected ? 'text-sib-navy' : 'text-gray-800'}`}>
                            {page.title}
                          </p>
                          {dated ? (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDate(dated)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">Non personnalisé</p>
                          )}
                        </div>
                        {hasContent && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"
                            title="Contenu personnalisé actif"
                          />
                        )}
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-sib-navy' : 'text-gray-300'}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Panneau droit — éditeur */}
          <div className="lg:col-span-8">
            {!selectedPage ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center py-40">
                <div className="text-center text-gray-400">
                  <Edit3 className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-gray-500">Sélectionnez une page à modifier</p>
                  <p className="text-sm mt-1 text-gray-400">Cliquez sur une page dans le panneau de gauche</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {/* En-tête de l'éditeur */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sib-navy flex items-center justify-center flex-shrink-0">
                      <selectedPage.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedPage.title}</h2>
                      <a
                        href={selectedPage.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sib-gold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Voir la page en direct
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-sib-navy text-white text-sm font-bold rounded-xl hover:bg-sib-navy/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {isSaving
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />}
                      Sauvegarder
                    </button>
                  </div>
                </div>

                {/* Messages de statut */}
                {saveStatus === 'success' && (
                  <div className="mx-8 mt-5 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Modifications sauvegardées. Les visiteurs voient le nouveau contenu immédiatement.
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="mx-8 mt-5 px-5 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Erreur lors de la sauvegarde. Vérifiez votre connexion et vos droits d'administration.
                  </div>
                )}

                {/* Champs éditables */}
                <div className="px-8 py-6 space-y-6">
                  <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs">
                    <span className="text-base flex-shrink-0">💡</span>
                    <span>
                      Les champs sont préremplis avec le contenu actuel de la page. Seules les valeurs
                      modifiées (différentes du contenu par défaut) sont enregistrées comme personnalisation.
                    </span>
                  </div>

                  {selectedPage.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={editValues[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? ''}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-sib-navy/20 focus:border-sib-navy transition-colors placeholder:text-gray-300"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editValues[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? ''}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sib-navy/20 focus:border-sib-navy transition-colors placeholder:text-gray-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
