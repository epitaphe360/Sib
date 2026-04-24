import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Cookie, Settings, Shield, Info } from 'lucide-react';
import { toast } from 'sonner';

const cookieTypes = [
  {
    title: 'Cookies Essentiels',
    accent: 'primary',
    desc: 'Nécessaires au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.',
    items: ['Authentification et sécurité', 'Gestion de session', 'Préférences de langue', 'Protection CSRF'],
  },
  {
    title: 'Cookies Analytiques',
    accent: 'success',
    desc: "Nous aident à comprendre comment vous utilisez la plateforme pour l'améliorer.",
    items: ['Pages les plus consultées', 'Temps passé sur le site', 'Actions des utilisateurs', 'Performances techniques'],
  },
  {
    title: 'Cookies Fonctionnels',
    accent: 'accent',
    desc: 'Améliorent votre expérience en mémorisant vos préférences.',
    items: ['Thème (clair/sombre)', 'Taille de police', 'Position des éléments', 'Historique de recherche'],
  },
  {
    title: 'Cookies Marketing',
    accent: 'warning',
    desc: 'Utilisés pour vous proposer du contenu personnalisé et des offres pertinentes.',
    items: ['Préférences de contenu', 'Recommandations personnalisées', 'Campagnes ciblées', 'Réseaux sociaux intégrés'],
  },
];

const accentClass: Record<string, string> = {
  primary: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
  success: 'border-success-500 bg-success-50 dark:bg-success-500/10',
  accent: 'border-accent-500 bg-accent-50 dark:bg-accent-500/10',
  warning: 'border-warning-500 bg-warning-50 dark:bg-warning-500/10',
};

const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 lg:p-10 ${className}`}
  >
    {children}
  </div>
);

const Toggle: React.FC<{ defaultChecked?: boolean; disabled?: boolean }> = ({ defaultChecked, disabled }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} disabled={disabled} />
    <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-70" />
  </label>
);

export default function CookiesPage() {
  const { t } = useTranslation();
  const handleCookieSettings = () => {
    toast.success('Préférences de cookies mises à jour.');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="sib-kicker mb-3 justify-center">Légal</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
            {t('legal.cookies_title')}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* What is a cookie */}
        <SectionCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Cookie className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Qu'est-ce qu'un cookie ?</h2>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre ordinateur lorsque vous visitez notre site web.
            Il permet à la plateforme de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
          </p>
        </SectionCard>

        {/* Cookie types */}
        <SectionCard>
          <div className="flex items-start gap-4 mb-6">
            <div className="h-10 w-10 rounded-lg bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-success-600 dark:text-success-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Types de cookies utilisés</h2>
          </div>
          <div className="space-y-4">
            {cookieTypes.map((ct) => (
              <div key={ct.title} className={`border-l-2 pl-4 py-1 rounded-r ${accentClass[ct.accent]}`}>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                  {ct.title}
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">{ct.desc}</p>
                <ul className="list-disc pl-5 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                  {ct.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Retention */}
        <SectionCard>
          <div className="flex items-start gap-4 mb-6">
            <div className="h-10 w-10 rounded-lg bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-danger-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Durée de conservation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                Cookies de Session
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Supprimés automatiquement à la fermeture du navigateur.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                Cookies Persistants
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Conservés jusqu'à 13 mois maximum selon la législation.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Manage */}
        <SectionCard>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">Gestion de vos cookies</h2>
          <div className="space-y-3">
            {[
              { title: 'Cookies Essentiels', desc: 'Toujours activés — nécessaires au fonctionnement', locked: true, checked: true },
              { title: 'Cookies Analytiques', desc: 'Aide à améliorer la plateforme', locked: false, checked: true },
              { title: 'Cookies Fonctionnels', desc: 'Améliore votre expérience utilisateur', locked: false, checked: true },
              { title: 'Cookies Marketing', desc: 'Contenu personnalisé et recommandations', locked: false, checked: false },
            ].map((row) => (
              <div
                key={row.title}
                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              >
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                    {row.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{row.desc}</p>
                </div>
                {row.locked ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-300 text-xs font-semibold uppercase tracking-wider">
                    Activé
                  </span>
                ) : (
                  <Toggle defaultChecked={row.checked} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="primary" size="md" onClick={handleCookieSettings}>
              Sauvegarder mes préférences
            </Button>
          </div>
        </SectionCard>

        {/* Browser guides */}
        <SectionCard>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
            Comment gérer les cookies dans votre navigateur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: 'Google Chrome', path: 'Paramètres → Confidentialité → Cookies et autres données des sites' },
              { name: 'Mozilla Firefox', path: 'Préférences → Vie privée → Cookies' },
              { name: 'Safari', path: 'Préférences → Confidentialité → Gérer les données de sites web' },
              { name: 'Microsoft Edge', path: 'Paramètres → Cookies et autorisations de site' },
            ].map((b) => (
              <div key={b.name}>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 tracking-tight">
                  {b.name}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{b.path}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/40 rounded-xl flex items-start gap-3">
            <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
            <p className="text-primary-800 dark:text-primary-200 text-sm leading-relaxed">
              <strong>Note :</strong> la désactivation de certains cookies peut affecter le fonctionnement de la
              plateforme et limiter certaines fonctionnalités.
            </p>
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
              Besoin d'aide ?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Pour toute question concernant les cookies ou vos données personnelles :
            </p>
            <div className="inline-block bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl text-left">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                <strong className="text-neutral-900 dark:text-white">Délégué à la Protection des Données</strong>
                <br />
                Email : privacy@sibevent.com<br />
                Téléphone : +212 1 23 45 67 92
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
