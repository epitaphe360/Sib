/**
 * Réécrit les pages publiques avec du texte français UTF-8 correct.
 * Usage: node scripts/fix-public-pages-encoding.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../app-urbaevent/web/src/pages/public');

function writeUtf8(relativePath, content) {
  const fullPath = path.join(__dirname, '..', relativePath);
  fs.writeFileSync(fullPath, content, { encoding: 'utf8' });
  console.log('OK', relativePath);
}

const pourquoiExposer = `import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Globe, Target, BarChart3, Handshake, Eye, Award } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import PublicPageLayout from '../../components/layout/PublicPageLayout';
import { SibPublicHero } from '../../components/ui/SibPublicHero';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  AnimatedCounter, HeroReveal, scaleUp,
} from '../../components/ui/motion';

const defaultSecteurs = [
  'Gros \u0153uvre & Structure', 'Menuiserie & Fermeture', 'D\u00e9coration & Am\u00e9nagement',
  'Climatisation & Sanitaire', '\u00c9quipements \u00e9lectriques', 'Mat\u00e9riels & Machines',
  'Environnement Durable', 'Formation & Institutions', 'Immobilier & Financement',
  'Technologies Num\u00e9riques',
];

const defaultChiffres = [
  { value: '600+', label: 'Exposants' },
  { value: '200 000+', label: 'Visiteurs' },
  { value: '35 000 m\u00b2', label: 'Surface' },
  { value: '50', label: 'Pays' },
  { value: '5', label: 'Jours' },
  { value: '10', label: 'Secteurs' },
];

const defaultArguments = [
  {
    icon: Users,
    title: '200 000+ visiteurs',
    desc: "Architectes, ing\u00e9nieurs, promoteurs, d\u00e9cideurs publics et priv\u00e9s venus du Maroc, d'Afrique et du monde entier.",
  },
  {
    icon: Globe,
    title: '50 pays repr\u00e9sent\u00e9s',
    desc: '600 exposants et 1 500 marques internationales r\u00e9unis sur 35 000 m\u00b2 : pavillons nationaux et d\u00e9l\u00e9gations institutionnelles.',
  },
  {
    icon: Target,
    title: 'Visibilit\u00e9 renforc\u00e9e',
    desc: 'Plan m\u00e9dia international ambitieux, pr\u00e9sence digitale soutenue, couverture presse et vid\u00e9os diffus\u00e9es sur SIB TV et les plateformes officielles.',
  },
  {
    icon: BarChart3,
    title: '300 rencontres B2B',
    desc: 'Des \u00e9changes cibl\u00e9s organis\u00e9s via URBA EVENT, la plateforme digitale connect\u00e9e du salon. Chaque stand devient un espace de connexion.',
  },
  {
    icon: Handshake,
    title: '80% de reconduction',
    desc: 'Un taux de fid\u00e9lisation exceptionnel, reflet de la confiance des exposants et de la qualit\u00e9 du salon.',
  },
  {
    icon: Award,
    title: '\u00c9dition anniversaire 40 ans',
    desc: "Pour ses 40 ans, le SIB franchit un cap : plus d'espace, plus d'exposants, des zones th\u00e9matiques repens\u00e9es et des espaces de d\u00e9monstration interactifs.",
  },
];

export default function PourquoiExposerPage() {
  const cms = usePageContent('pourquoi-exposer');

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const chiffres = (() => {
    const raw = cms.stats_json;
    if (!raw) return defaultChiffres;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultChiffres;
    } catch {
      return defaultChiffres;
    }
  })();

  const secteurs_cles = (() => {
    const raw = cms.sectors_json;
    if (!raw) return defaultSecteurs;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed.map((s: unknown) => String(s))
        : defaultSecteurs;
    } catch {
      return defaultSecteurs;
    }
  })();

  const arguments_exposer = [
    { icon: Users, title: getCms('arg_1_title', defaultArguments[0].title), desc: getCms('arg_1_desc', defaultArguments[0].desc) },
    { icon: Globe, title: getCms('arg_2_title', defaultArguments[1].title), desc: getCms('arg_2_desc', defaultArguments[1].desc) },
    { icon: Target, title: getCms('arg_3_title', defaultArguments[2].title), desc: getCms('arg_3_desc', defaultArguments[2].desc) },
    { icon: BarChart3, title: getCms('arg_4_title', defaultArguments[3].title), desc: getCms('arg_4_desc', defaultArguments[3].desc) },
    { icon: Handshake, title: getCms('arg_5_title', defaultArguments[4].title), desc: getCms('arg_5_desc', defaultArguments[4].desc) },
    { icon: Award, title: getCms('arg_6_title', defaultArguments[5].title), desc: getCms('arg_6_desc', defaultArguments[5].desc) },
  ];

  return (
    <PublicPageLayout>
      <SibPublicHero
        title={cms.hero_title || 'Pourquoi Exposer au SIB ?'}
        subtitle={
          cms.hero_subtitle ||
          "Le rendez-vous incontournable du b\u00e2timent en Afrique. Participez \u00e0 l'\u00e9dition anniversaire des 40 ans du SIB aux c\u00f4t\u00e9s de 600 exposants et 200 000 visiteurs professionnels."
        }
        image="/sib2026-home-v4/assets/sib-hero.webp"
      >
        <HeroReveal delay={0.3}>
          <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="sib-v4-btn-orange gap-2 shadow-lg">
            <TrendingUp className="w-5 h-5" />
            {getCms('hero_cta', 'R\u00e9servez votre stand')}
          </Link>
        </HeroReveal>
      </SibPublicHero>

      <div className="sib-v4-container -mt-10">
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {chiffres.map((c) => (
            <StaggerItem key={c.label}>
              <HoverCard className="bg-white rounded-xl shadow-lg p-5 text-center border border-gray-100 h-full">
                <AnimatedCounter value={c.value} className="text-2xl font-bold text-sib-navy block" />
                <div className="text-sm text-gray-500 mt-1">{c.label}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      <div className="sib-v4-container py-16">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-sib-navy mb-10 text-center font-display">
            {getCms('reasons_title', "6 raisons d'exposer")}
          </h2>
        </ScrollReveal>
        <StaggerReveal slow className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arguments_exposer.map((arg) => (
            <StaggerItem key={arg.title}>
              <HoverCard className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-14 h-14 rounded-xl bg-sib-gold/10 flex items-center justify-center mb-5">
                  <arg.icon className="w-7 h-7 text-sib-gold" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{arg.title}</h3>
                <p className="text-gray-600 leading-relaxed">{arg.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      <div className="bg-sib-navy/5 py-16">
        <div className="sib-v4-container">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-sib-navy mb-8 text-center font-display">
              {getCms('sectors_title', 'Secteurs repr\u00e9sent\u00e9s')}
            </h2>
          </ScrollReveal>
          <StaggerReveal className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {secteurs_cles.map((s) => (
              <StaggerItem key={s}>
                <span className="inline-block px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-sib-gold/50 transition-all duration-300 cursor-default">
                  {s}
                </span>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>

      <div className="bg-sib-gold py-16">
        <div className="sib-v4-container text-center">
          <ScrollReveal variant={scaleUp}>
            <Eye className="w-12 h-12 text-sib-navy mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-sib-navy mb-4 font-display">
              {getCms('cta_title', 'Pr\u00eat \u00e0 exposer ?')}
            </h3>
            <p className="text-sib-navy/70 max-w-xl mx-auto mb-8">
              {getCms(
                'cta_text',
                'R\u00e9servez votre stand d\u00e8s maintenant et b\u00e9n\u00e9ficiez des meilleurs emplacements pour la 20\u00e8me \u00e9dition du SIB.'
              )}
            </p>
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="inline-flex items-center gap-2 px-8 py-4 bg-sib-navy text-white rounded-lg font-bold text-lg hover:bg-sib-navy/90 transition-all duration-300 hover:scale-105 transform"
            >
              {getCms('cta_button', 'Demander un devis')}
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </PublicPageLayout>
  );
}
`;

writeUtf8('app-urbaevent/web/src/pages/public/PourquoiExposerPage.tsx', pourquoiExposer);

// Fix PresentationPage in place via regex replacements on corrupted patterns
const presentationPath = path.join(publicDir, 'PresentationPage.tsx');
let presentation = fs.readFileSync(presentationPath, 'utf8');

const presentationFixes = [
  ['Minist?re', 'Minist\u00e8re'],
  ['Am?nagement', 'Am\u00e9nagement'],
  ['D?veloppement', 'D\u00e9veloppement'],
  ['F?d?ration', 'F\u00e9d\u00e9ration'],
  ['Mat?riaux', 'Mat\u00e9riaux'],
  ['B?timent', 'B\u00e2timent'],
  ['d?l?gu?', 'd\u00e9l\u00e9gu\u00e9'],
  ['?v?nementiel', '\u00e9v\u00e9nementiel'],
  ['repr?sent?es', 'repr\u00e9sent\u00e9es'],
  ['repr?sent?s', 'repr\u00e9sent\u00e9s'],
  ['35 000 m?', '35 000 m\u00b2'],
  [' m? ', ' m\u00b2 '],
  ['Fond?', 'Fond\u00e9'],
  ['impos?', 'impos\u00e9'],
  ['r?f?rence', 'r\u00e9f\u00e9rence'],
  ['b?timent', 'b\u00e2timent'],
  ['r?unit', 'r\u00e9unit'],
  ['m?me', 'm\u00eame'],
  ['planifi?es', 'planifi\u00e9es'],
  ['Organis?', 'Organis\u00e9'],
  ['co-organis?', 'co-organis\u00e9'],
  ['continuit?', 'continuit\u00e9'],
  ['qualit?', 'qualit\u00e9'],
  ['? travers', '\u00e0 travers'],
  ['ann?es', 'ann\u00e9es'],
  ['Au-del?', 'Au-del\u00e0'],
  ['port?e', 'port\u00e9e'],
  ['mat?riaux', 'mat\u00e9riaux'],
  ['o?', 'o\u00f9'],
  ['d?monstration', 'd\u00e9monstration'],
  ['conf?rences', 'conf\u00e9rences'],
  ['anim?es', 'anim\u00e9es'],
  ['th?matiques', 'th\u00e9matiques'],
  ['D?monstration', 'D\u00e9monstration'],
  ['20?me ?dition', '20\u00e8me \u00e9dition'],
  ['c?l?bre', 'c\u00e9l\u00e8bre'],
  ['20? ?dition', '20\u00e8 \u00e9dition'],
  ['c?l?brant', 'c\u00e9l\u00e9brant'],
  ['d?roulera', 'd\u00e9roulera'],
  ['cl?s', 'cl\u00e9s'],
  ['Pr?sentation', 'Pr\u00e9sentation'],
  ['R?duire', 'R\u00e9duire'],
  ['Entr?e', 'Entr\u00e9e'],
  ['acc?s', 'acc\u00e8s'],
  ['enti?rement', 'enti\u00e8rement'],
  ['?lectronique', '\u00e9lectronique'],
  ['?tre', '\u00eatre'],
  ['T?l?chargez', 'T\u00e9l\u00e9chargez'],
  ['modalit?s', 'modalit\u00e9s'],
  ['SIB ? SIB', 'SIB \u2014 SIB'],
  ['SIB 2026 ? Pr?', 'SIB 2026 \u2014 Pr\u00e9'],
  ['1?? agence', '1\u02b3\u1d49 agence'],
];

for (const [from, to] of presentationFixes) {
  presentation = presentation.split(from).join(to);
}

fs.writeFileSync(presentationPath, presentation, { encoding: 'utf8' });
console.log('OK PresentationPage.tsx (patched)');

// Scan and report remaining corruption in public pages
const badPattern = /[\uFFFD]|[\u0080-\u009f]|(?:[a-zA-Z])\?(?:[a-zA-Z])/g;
for (const file of fs.readdirSync(publicDir).filter((f) => f.endsWith('.tsx'))) {
  const text = fs.readFileSync(path.join(publicDir, file), 'utf8');
  const lines = text.split('\n');
  const issues = [];
  lines.forEach((line, i) => {
    if (line.includes('\uFFFD') || /\b[a-zA-Z]\?[a-zA-Z]/.test(line)) {
      if (!line.includes('?autoplay') && !line.includes('?embedded') && !line.includes('??.')) {
        issues.push(i + 1);
      }
    }
  });
  if (issues.length) console.log('WARN', file, 'lines:', issues.slice(0, 5).join(', '));
}
