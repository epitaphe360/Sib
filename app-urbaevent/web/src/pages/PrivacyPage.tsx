import { useTranslation } from '../hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="sib-kicker mb-3 justify-center">Légal</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
            {t('legal.privacy_title')}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 lg:p-10">
          <div className="max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">1. Collecte des Données</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              SIB 2026 collecte les informations suivantes lorsque vous utilisez notre plateforme :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Informations d'identification (nom, email, téléphone)</li>
              <li>Informations professionnelles (société, poste, secteur)</li>
              <li>Données d'utilisation de la plateforme</li>
              <li>Préférences de communication</li>
              <li>Informations de connexion et de navigation</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">2. Utilisation des Données</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Fournir et améliorer nos services</li>
              <li>Faciliter les connexions professionnelles</li>
              <li>Communiquer avec vous concernant l'événement</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">3. Partage des Données</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Avec votre consentement explicite</li>
              <li>Pour faciliter les rendez-vous professionnels</li>
              <li>Avec nos prestataires de services (hébergement, sécurité)</li>
              <li>Lorsque requis par la loi</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">4. Sécurité des Données</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
              <li>Stockage sécurisé des données</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Audits de sécurité réguliers</li>
              <li>Sauvegardes automatiques</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">5. Vos Droits</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
              <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">6. Cookies et Traçage</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous utilisons des cookies pour améliorer votre expérience :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Cookies essentiels pour le fonctionnement du site</li>
              <li>Cookies analytiques pour comprendre l'utilisation</li>
              <li>Cookies de préférences pour mémoriser vos choix</li>
              <li>Cookies marketing (avec votre consentement)</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">7. Conservation des Données</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous conservons vos données aussi longtemps que nécessaire pour :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Fournir nos services</li>
              <li>Respecter nos obligations légales</li>
              <li>Résoudre les litiges</li>
              <li>Maintenir la sécurité</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">8. Contact</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Pour toute question concernant cette politique de confidentialité :
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                <strong className="text-neutral-900 dark:text-white">Délégué à la Protection des Données</strong>
                <br />
                Email : privacy@sibevent.com<br />
                Téléphone : +212 1 23 45 67 92<br />
                Adresse : El Jadida, Maroc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


