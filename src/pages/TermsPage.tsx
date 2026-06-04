import { useTranslation } from '../hooks/useTranslation';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="sib-kicker mb-3 justify-center">Légal</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
            {t('legal.terms_title')}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 lg:p-10">
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:text-neutral-900 dark:prose-h2:text-white prose-h2:tracking-tight prose-h2:mt-8 prose-h2:mb-4 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:text-[15px] prose-p:leading-relaxed prose-p:mb-4 prose-li:text-neutral-700 dark:prose-li:text-neutral-300">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">1. Acceptation des Conditions</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              En accédant et utilisant la plateforme SIB 2026, vous acceptez d'être lié par les présentes conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">2. Description du Service</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              SIB 2026 est une plateforme digitale qui facilite les connexions professionnelles entre :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Exposants et visiteurs du Salon International du Bâtiment</li>
              <li>Professionnels du secteur du bâtiment et de la construction</li>
              <li>Partenaires et prestataires de services</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">3. Conditions d'Inscription</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Pour utiliser notre plateforme, vous devez :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Être âgé d'au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Utiliser la plateforme de manière responsable</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">4. Utilisation Acceptable</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Vous vous engagez à utiliser la plateforme de manière responsable et à ne pas :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Violer les droits d'autrui</li>
              <li>Publier du contenu inapproprié ou illégal</li>
              <li>Perturber le fonctionnement de la plateforme</li>
              <li>Utiliser des robots ou scripts automatisés</li>
              <li>Tenter de compromettre la sécurité</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">5. Propriété Intellectuelle</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Tout le contenu de la plateforme SIB 2026 est protégé par le droit d'auteur :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Le contenu créé par SIB 2026 reste notre propriété</li>
              <li>Vous conservez les droits sur votre contenu personnel</li>
              <li>L'utilisation commerciale nécessite notre autorisation</li>
              <li>La marque SIB est déposée et protégée</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">6. Responsabilités</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              <strong>Nos responsabilités :</strong>
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Fournir un service de qualité et sécurisé</li>
              <li>Protéger vos données personnelles</li>
              <li>Maintenir la disponibilité de la plateforme</li>
              <li>Répondre à vos demandes dans les délais raisonnables</li>
            </ul>

            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              <strong>Vos responsabilités :</strong>
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Fournir des informations exactes</li>
              <li>Utiliser la plateforme de manière éthique</li>
              <li>Respecter la confidentialité des autres utilisateurs</li>
              <li>Signaler tout contenu inapproprié</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">7. Résiliation</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous nous réservons le droit de suspendre ou résilier votre compte si :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Vous violez ces conditions d'utilisation</li>
              <li>Vos informations sont inexactes</li>
              <li>Une activité suspecte est détectée</li>
              <li>Vous ne respectez pas l'esprit de la plateforme</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">8. Limitation de Responsabilité</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Dans les limites permises par la loi, SIB 2026 ne peut être tenu responsable de :
            </p>
            <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4 space-y-1">
              <li>Pertes indirectes ou consécutives</li>
              <li>Interruptions temporaires du service</li>
              <li>Actions des autres utilisateurs</li>
              <li>Contenus tiers intégrés à la plateforme</li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">9. Modifications</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet immédiatement après publication.
              Votre utilisation continue de la plateforme constitue l'acceptation des nouvelles conditions.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">10. Droit Applicable</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Ces conditions sont régies par le droit marocain.
              Tout litige sera soumis à la compétence des tribunaux d'El Jadida.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4">11. Contact</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed mb-4">
              Pour toute question concernant ces conditions :
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                <strong className="text-neutral-900 dark:text-white">Service Juridique SIB 2026</strong>
                <br />
                Email : legal@sibevent.com<br />
                Téléphone : +212 1 23 45 67 93<br />
                Adresse : El Jadida, Maroc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


