import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Code, Key, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { CONFIG, getSupportEmail, getSupportPhone, getSupportMessage, getApiUrl } from '../lib/config';

export default function APIPage() {
  const { t } = useTranslation();
  const handleAPIRequest = () => {
    toast.success(getSupportMessage('api'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API SIB
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intégrez les données de SIB 2026 dans vos applications et systèmes d'information.
          </p>
        </div>

        {/* API Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-8 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              API RESTful
            </h3>
            <p className="text-gray-600 mb-6">
              Interface REST complète pour accéder aux données des exposants, visiteurs et événements.
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Endpoints documentés</li>
              <li>• Format JSON standard</li>
              <li>• Authentification JWT</li>
              <li>• Rate limiting intelligent</li>
            </ul>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Temps réel
            </h3>
            <p className="text-gray-600 mb-6">
              WebSockets pour les mises à jour en temps réel des données et notifications.
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Notifications push</li>
              <li>• Mises à jour live</li>
              <li>• Événements temps réel</li>
              <li>• Synchronisation automatique</li>
            </ul>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Key className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Sécurité
            </h3>
            <p className="text-gray-600 mb-6">
              Protocoles de sécurité avancés pour protéger vos données et intégrations.
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Chiffrement SSL/TLS</li>
              <li>• Authentification OAuth 2.0</li>
              <li>• Gestion des permissions</li>
              <li>• Audit logs complets</li>
            </ul>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Principaux Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Données des Exposants
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-green-600">GET /api/exhibitors</div>
                <div className="text-blue-600">GET /api/exhibitors/{'{id}'}</div>
                <div className="text-orange-600">POST /api/exhibitors</div>
                <div className="text-purple-600">PUT /api/exhibitors/{'{id}'}</div>
              </div>
              <p className="text-gray-600">
                Accédez aux informations des exposants, leurs produits et services.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Gestion des Rendez-vous
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-green-600">GET /api/appointments</div>
                <div className="text-blue-600">GET /api/appointments/{'{id}'}</div>
                <div className="text-orange-600">POST /api/appointments</div>
                <div className="text-red-600">DELETE /api/appointments/{'{id}'}</div>
              </div>
              <p className="text-gray-600">
                Gérez les rendez-vous entre visiteurs et exposants.
              </p>
            </div>
          </div>
        </Card>

        {/* Getting Started */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Démarrage Rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. Obtenir une clé API
              </h3>
              <p className="text-gray-600 mb-4">
                Contactez notre équipe pour obtenir vos identifiants d'API.
              </p>
              <Button onClick={handleAPIRequest} className="mb-4">
                Demander une clé API
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                2. Authentification
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-blue-600">curl -X POST {getApiUrl(CONFIG.urls.api.auth)}</div>
                <div className="text-gray-600">-H "Content-Type: application/json"</div>
                <div className="text-gray-600">-d '{`{"apiKey": "your-api-key"}`}'</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Documentation */}
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Documentation Complète
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Consultez notre documentation détaillée pour intégrer pleinement l'API SIB.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.open(CONFIG.urls.api.docs, '_blank')} size="lg">
              Voir la Documentation
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`mailto:${getSupportEmail('api')}`)}
            >
              Support API
            </Button>
          </div>
          <p className="text-gray-500 mt-4">
            Email: {getSupportEmail('api')} | Téléphone: {getSupportPhone('api')}
          </p>
        </Card>
      </div>
    </div>
  );
}


