import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Cookie, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PageHero } from '../components/ui/PageHero';

export default function CookiesPage() {
  const { t } = useTranslation();
  const handleCookieSettings = () => {
    toast.success('Préférences de cookies mises à jour !');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <PageHero
        badge={<><Cookie className="w-4 h-4 text-yellow-300" /><span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Cookies</span></>}
        title={<>{t('legal.cookies_title')}</>}
        subtitle={`${t('legal.last_update')} : ${new Date().toLocaleDateString('fr-FR')}`}
        py="py-14 md:py-18"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Cookie className="h-8 w-8 text-indigo-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Qu'est-ce qu'un cookie ?</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Un cookie est un petit fichier texte déposé sur votre ordinateur lorsque vous visitez notre site web.
            Il permet à la plateforme de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
          </p>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-green-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Types de Cookies Utilisés</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Essentiels</h3>
              <p className="text-gray-700 mb-2">
                Nécessaires au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Authentification et sécurité</li>
                <li>Gestion de session</li>
                <li>Préférences de langue</li>
                <li>Protection CSRF</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Analytiques</h3>
              <p className="text-gray-700 mb-2">
                Nous aident à comprendre comment vous utilisez la plateforme pour l'améliorer.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Pages les plus consultées</li>
                <li>Temps passé sur le site</li>
                <li>Actions des utilisateurs</li>
                <li>Performances techniques</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Fonctionnels</h3>
              <p className="text-gray-700 mb-2">
                Améliorent votre expérience en mémorisant vos préférences.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Thème (clair/sombre)</li>
                <li>Taille de police</li>
                <li>Position des éléments</li>
                <li>Historique de recherche</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Marketing</h3>
              <p className="text-gray-700 mb-2">
                Utilisés pour vous proposer du contenu personnalisé et des offres pertinentes.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Préférences de contenu</li>
                <li>Recommandations personnalisées</li>
                <li>Campagnes ciblées</li>
                <li>Réseaux sociaux intégrés</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-red-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Durée de Conservation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies de Session</h3>
              <p className="text-gray-700 text-sm">
                Supprimés automatiquement à la fermeture du navigateur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies Persistants</h3>
              <p className="text-gray-700 text-sm">
                Conservés jusqu'à 13 mois maximum selon la législation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion de vos Cookies</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Essentiels</h3>
                <p className="text-gray-600 text-sm">Toujours activés - Nécessaires au fonctionnement</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Activé
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Analytiques</h3>
                <p className="text-gray-600 text-sm">Aide à améliorer la plateforme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Fonctionnels</h3>
                <p className="text-gray-600 text-sm">Améliore votre expérience utilisateur</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Marketing</h3>
                <p className="text-gray-600 text-sm">Contenu personnalisé et recommandations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleCookieSettings} size="lg">
              Sauvegarder mes préférences
            </Button>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment gérer les cookies dans votre navigateur</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Chrome</h3>
              <p className="text-gray-600 text-sm mb-2">
                Paramètres â†’ Confidentialité â†’ Cookies et autres données des sites
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mozilla Firefox</h3>
              <p className="text-gray-600 text-sm mb-2">
                Préférences â†’ Vie privée â†’ Cookies
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Safari</h3>
              <p className="text-gray-600 text-sm mb-2">
                Préférences â†’ Confidentialité â†’ Gérer les données de sites web
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h3>
              <p className="text-gray-600 text-sm mb-2">
                Paramètres â†’ Cookies et autorisations de site
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-indigo-800 text-sm">
              <strong>Note :</strong> La désactivation de certains cookies peut affecter le fonctionnement de la plateforme
              et limiter certaines fonctionnalités.
            </p>
          </div>

          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant les cookies ou vos données personnelles :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <p className="text-gray-700">
                <strong>Délégué à la Protection des Données</strong><br />
                Email : privacy@sibevent.com<br />
                Téléphone : +212 6 88 50 05 00
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}



