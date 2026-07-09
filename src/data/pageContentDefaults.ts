/**
 * Valeurs par défaut des pages vitrine (alignées sur les fallbacks des composants publics).
 * Utilisées par l’admin CMS pour pré-remplir l’éditeur quand Supabase est vide.
 */
export const PAGE_CONTENT_DEFAULTS: Record<string, Record<string, string>> = {
  'espaces-sib': {
    hero_badge: '5 espaces dédiés',
    hero_title: 'Espaces SIB',
    hero_subtitle:
      "Parce que le SIB ne se résume pas qu'aux stands d'exposition, plusieurs espaces sont également mis en avant.",
    espace_1_title: '2 Espaces de Démonstration',
    espace_1_desc:
      "Le SIB 2026 dispose de 2 espaces de démonstration conçus pour permettre aux professionnels du bâtiment de présenter leurs innovations en direct. Ces plateformes offrent une opportunité unique d'interagir avec les visiteurs, de valoriser les pratiques exemplaires et de démontrer concrètement la performance des matériaux, solutions et 30 applications techniques.",
    espace_2_title: 'Espace Formation — SIB Academy',
    espace_2_desc:
      "SIB Academy est le pôle formation du Salon. Cet espace regroupe les stands des Académies, Instituts, Universités, Écoles Privées et Centres Professionnels proposant des formations liées aux secteurs du Bâtiment, de l'Urbanisme et de l'Architecture. Plus de 20 conférences sont prévues avec des experts marocains et internationaux.",
    espace_3_title: 'Espace Recrutement',
    espace_3_desc:
      "En partenariat avec l'Anapec, le SIB met à disposition des visiteurs un espace où il est permis de déposer son CV, de passer des entretiens et de rencontrer ses futurs employeurs directement pendant le salon.",
    espace_4_title: 'SIB TV',
    espace_4_desc:
      "SIB TV est la chaîne web officielle du salon. Avec ses plateaux TV, elle assure une couverture médiatique complète de l'événement. Interviews, débats et reportages sont diffusés en continu pendant les 5 jours du salon, offrant une visibilité maximale aux exposants et partenaires.",
    espace_5_title: 'URBA EVENT — B2B',
    espace_5_desc:
      "URBA EVENT est le programme de rencontres d'affaires B2B du SIB. Pour l'édition 2026, 300 rencontres qualifiées sont planifiées entre exposants nationaux et internationaux. L'objectif : faciliter les partenariats stratégiques et la signature de contrats pendant les 5 jours du salon.",
    cta_title: 'Intéressé par un espace ?',
    cta_text:
      'Contactez-nous pour en savoir plus sur les modalités de participation et de réservation.',
    cta_url: '/contact',
    cta_button: 'Contactez-nous',
    espaces_json: JSON.stringify(
      [
        {
          title: '2 Espaces de Démonstration',
          description:
            "Le SIB 2026 dispose de 2 espaces de démonstration conçus pour permettre aux professionnels du bâtiment de présenter leurs innovations en direct.",
        },
        {
          title: 'Espace Formation — SIB Academy',
          description:
            "SIB Academy est le pôle formation du Salon — Académies, Instituts, Universités et Centres Professionnels.",
        },
        {
          title: 'Espace Recrutement',
          description:
            "En partenariat avec l'Anapec — dépôt de CV et entretiens sur place.",
        },
        {
          title: 'SIB TV',
          description:
            "Chaîne web officielle du salon — interviews, débats et reportages en continu.",
        },
        {
          title: 'URBA EVENT — B2B',
          description:
            "300 rencontres qualifiées planifiées entre exposants nationaux et internationaux.",
        },
      ],
      null,
      2,
    ),
  },
};

export function getPageContentDefaults(pageSlug: string): Record<string, string> {
  return { ...(PAGE_CONTENT_DEFAULTS[pageSlug] ?? {}) };
}

export function mergePageContentWithDefaults(
  pageSlug: string,
  stored: Record<string, string>,
): Record<string, string> {
  return { ...getPageContentDefaults(pageSlug), ...stored };
}
