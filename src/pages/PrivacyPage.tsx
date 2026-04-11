import { Card } from '../components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.privacy_title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Collecte des Données</h2>
            <p className="text-gray-700 mb-6">
              SIB 2026 collecte les informations suivantes lorsque vous utilisez notre plateforme :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Informations d'identification (nom, email, téléphone)</li>
              <li>Informations professionnelles (société, poste, secteur)</li>
              <li>Données d'utilisation de la plateforme</li>
              <li>Préférences de communication</li>
              <li>Informations de connexion et de navigation</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Utilisation des Données</h2>
            <p className="text-gray-700 mb-6">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir et améliorer nos services</li>
              <li>Faciliter les connexions professionnelles</li>
              <li>Communiquer avec vous concernant l'événement</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Partage des Données</h2>
            <p className="text-gray-700 mb-6">
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Avec votre consentement explicite</li>
              <li>Pour faciliter les rendez-vous professionnels</li>
              <li>Avec nos prestataires de services (hébergement, sécurité)</li>
              <li>Lorsque requis par la loi</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Sécurité des Données</h2>
            <p className="text-gray-700 mb-6">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
              <li>Stockage sécurisé des données</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Audits de sécurité réguliers</li>
              <li>Sauvegardes automatiques</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Vos Droits</h2>
            <p className="text-gray-700 mb-6">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
              <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cookies et Traçage</h2>
            <p className="text-gray-700 mb-6">
              Nous utilisons des cookies pour améliorer votre expérience :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Cookies essentiels pour le fonctionnement du site</li>
              <li>Cookies analytiques pour comprendre l'utilisation</li>
              <li>Cookies de préférences pour mémoriser vos choix</li>
              <li>Cookies marketing (avec votre consentement)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Conservation des Données</h2>
            <p className="text-gray-700 mb-6">
              Nous conservons vos données aussi longtemps que nécessaire pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir nos services</li>
              <li>Respecter nos obligations légales</li>
              <li>Résoudre les litiges</li>
              <li>Maintenir la sécurité</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant cette politique de confidentialité :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Délégué à la Protection des Données</strong><br />
                Email : privacy@sib2026.ma<br />
                Téléphone : +212 1 23 45 67 92<br />
                Adresse : Casablanca, Maroc
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


