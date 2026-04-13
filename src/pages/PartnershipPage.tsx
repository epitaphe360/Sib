import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Handshake, Star, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getSupportEmail, getSupportPhone, getSupportMessage } from '../lib/config';

export default function PartnershipPage() {
  const { t } = useTranslation();
  const handleContact = () => {
    toast.success(getSupportMessage('partnership'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Partenariats SIB 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez l'écosystème bâtiment international et bénéficiez d'une visibilité exceptionnelle auprès des décideurs du secteur.
          </p>
        </div>

        {/* Partnership Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-8 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire Premium
            </h3>
            <p className="text-gray-600 mb-6">
              Visibilité maximale avec logo sur tous les supports de communication et présence dans les zones VIP.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>• Logo sur le site web principal</li>
              <li>• Présence dans les newsletters</li>
              <li>• Accès aux zones VIP</li>
              <li>• Stand dédié dans les pavillons</li>
            </ul>
            <Button onClick={handleContact} className="w-full">
              Devenir Partenaire Premium
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire Technique
            </h3>
            <p className="text-gray-600 mb-6">
              Participez aux conférences techniques et démontrez votre expertise auprès des professionnels du secteur.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>• Intervention dans les conférences</li>
              <li>• Présence dans le catalogue officiel</li>
              <li>• Accès aux données des participants</li>
              <li>• Support marketing personnalisé</li>
            </ul>
            <Button onClick={handleContact} variant="outline" className="w-full">
              Devenir Partenaire Technique
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire Média
            </h3>
            <p className="text-gray-600 mb-6">
              Couvrez l'événement et bénéficiez d'un accès privilégié aux informations et aux intervenants.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>• Accréditation presse complète</li>
              <li>• Accès aux conférences et ateliers</li>
              <li>• Communiqués de presse exclusifs</li>
              <li>• Photos et vidéos officielles</li>
            </ul>
            <Button onClick={handleContact} variant="outline" className="w-full">
              Devenir Partenaire Média
            </Button>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Avantages du Partenariat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Visibilité Internationale
              </h3>
              <p className="text-gray-600 mb-4">
                SIB 2026 rassemble plus de 600 exposants et 200 000 visiteurs professionnels du monde entier.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Exposition auprès de décideurs clés</li>
                <li>• Couverture médiatique internationale</li>
                <li>• Réseau professionnel étendu</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Retour sur Investissement
              </h3>
              <p className="text-gray-600 mb-4">
                Nos partenaires bénéficient d'un ROI démontré grâce à notre stratégie marketing ciblée.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Génération de leads qualifiés</li>
                <li>• Opportunités business concrètes</li>
                <li>• Image de marque renforcée</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Section */}
        <Card className="p-8 text-center">
          <Handshake className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à nous rejoindre ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contactez notre équipe commerciale pour discuter de votre projet de partenariat et découvrir les opportunités adaptées à vos objectifs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleContact} size="lg">
              Contactez-nous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`mailto:${getSupportEmail('commercial')}`)}
            >
              Envoyer un email
            </Button>
          </div>
          <p className="text-gray-500 mt-4">
            Email: {getSupportEmail('commercial')} | Téléphone: {getSupportPhone('commercial')}
          </p>
        </Card>
      </div>
    </div>
  );
}


