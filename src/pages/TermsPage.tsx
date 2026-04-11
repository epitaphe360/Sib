import { Card } from '../components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.terms_title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptation des Conditions</h2>
            <p className="text-gray-700 mb-6">
              En accédant et utilisant la plateforme SIB 2026, vous acceptez d'être lié par les présentes conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description du Service</h2>
            <p className="text-gray-700 mb-6">
              SIB 2026 est une plateforme digitale qui facilite les connexions professionnelles entre :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Exposants et visiteurs du Salon International du Bâtiment</li>
              <li>Professionnels du secteur portuaire et maritime</li>
              <li>Partenaires et prestataires de services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Conditions d'Inscription</h2>
            <p className="text-gray-700 mb-6">
              Pour utiliser notre plateforme, vous devez :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Être âgé d'au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Utiliser la plateforme de manière responsable</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Utilisation Acceptable</h2>
            <p className="text-gray-700 mb-6">
              Vous vous engagez à utiliser la plateforme de manière responsable et à ne pas :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Violer les droits d'autrui</li>
              <li>Publier du contenu inapproprié ou illégal</li>
              <li>Perturber le fonctionnement de la plateforme</li>
              <li>Utiliser des robots ou scripts automatisés</li>
              <li>Tenter de compromettre la sécurité</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Propriété Intellectuelle</h2>
            <p className="text-gray-700 mb-6">
              Tout le contenu de la plateforme SIB 2026 est protégé par le droit d'auteur :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Le contenu créé par SIB 2026 reste notre propriété</li>
              <li>Vous conservez les droits sur votre contenu personnel</li>
              <li>L'utilisation commerciale nécessite notre autorisation</li>
              <li>La marque SIB est déposée et protégée</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Responsabilités</h2>
            <p className="text-gray-700 mb-6">
              <strong>Nos responsabilités :</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir un service de qualité et sécurisé</li>
              <li>Protéger vos données personnelles</li>
              <li>Maintenir la disponibilité de la plateforme</li>
              <li>Répondre à vos demandes dans les délais raisonnables</li>
            </ul>

            <p className="text-gray-700 mb-6">
              <strong>Vos responsabilités :</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir des informations exactes</li>
              <li>Utiliser la plateforme de manière éthique</li>
              <li>Respecter la confidentialité des autres utilisateurs</li>
              <li>Signaler tout contenu inapproprié</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Résiliation</h2>
            <p className="text-gray-700 mb-6">
              Nous nous réservons le droit de suspendre ou résilier votre compte si :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Vous violez ces conditions d'utilisation</li>
              <li>Vos informations sont inexactes</li>
              <li>Une activité suspecte est détectée</li>
              <li>Vous ne respectez pas l'esprit de la plateforme</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation de Responsabilité</h2>
            <p className="text-gray-700 mb-6">
              Dans les limites permises par la loi, SIB 2026 ne peut être tenu responsable de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Pertes indirectes ou consécutives</li>
              <li>Interruptions temporaires du service</li>
              <li>Actions des autres utilisateurs</li>
              <li>Contenus tiers intégrés à la plateforme</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Modifications</h2>
            <p className="text-gray-700 mb-6">
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet immédiatement après publication.
              Votre utilisation continue de la plateforme constitue l'acceptation des nouvelles conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Droit Applicable</h2>
            <p className="text-gray-700 mb-6">
              Ces conditions sont régies par le droit marocain.
              Tout litige sera soumis à la compétence des tribunaux d'Casablanca.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant ces conditions :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Service Juridique SIB 2026</strong><br />
                Email : legal@sib2026.ma<br />
                Téléphone : +212 1 23 45 67 93<br />
                Adresse : Casablanca, Maroc
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


