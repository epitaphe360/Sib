import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Users,
  MapPin,
  Tag
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function AddDemoProgramPage() {
  const navigate = useNavigate();
  const { pavilionId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const [programData, setProgramData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    speaker: '',
    company: '',
    type: 'presentation',
    capacity: 50,
    location: '',
    tags: [] as string[]
  });

  const demoTypes = [
    { value: 'presentation', label: 'Présentation' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'demo', label: 'Démonstration' },
    { value: 'roundtable', label: 'Table ronde' }
  ];

  const handleChange = (field: string, value: any) => {
    setProgramData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !programData.tags.includes(tag.trim())) {
      setProgramData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagIndex: number) => {
    setProgramData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== tagIndex)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ici vous pouvez implémenter la logique de sauvegarde

      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirection vers la liste des pavillons
  navigate(ROUTES.ADMIN_PAVILIONS);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du programme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to={ROUTES.ADMIN_PAVILIONS}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux Pavillons
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ajouter un Programme de Démonstration</h1>
              <p className="text-gray-600 mt-2">
                Ajouter un nouveau programme au pavillon sélectionné
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Informations du Programme
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="prog-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du Programme *
                  </label>
                  <input
                    id="prog-title"
                    type="text"
                    required
                    value={programData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Démonstration IA Portuaire"
                  />
                </div>

                <div>
                  <label htmlFor="prog-desc" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="prog-desc"
                    required
                    rows={3}
                    value={programData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez le programme et ses objectifs..."
                  />
                </div>

                <div>
                  <label htmlFor="prog-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Programme *
                  </label>
                  <select
                    id="prog-type"
                    required
                    value={programData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {demoTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Détails temporels et logistiques */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails Temporels & Logistiques</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-date" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    id="prog-date"
                    type="date"
                    required
                    value={programData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="prog-time" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Heure *
                  </label>
                  <input
                    id="prog-time"
                    type="time"
                    required
                    value={programData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="prog-duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Durée *
                  </label>
                  <input
                    id="prog-duration"
                    type="text"
                    required
                    value={programData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1h30"
                  />
                </div>

                <div>
                  <label htmlFor="prog-capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Capacité *
                  </label>
                  <input
                    id="prog-capacity"
                    type="number"
                    required
                    min="1"
                    value={programData.capacity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleChange('capacity', isNaN(val) ? 0 : val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="prog-location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Lieu *
                </label>
                <input
                  id="prog-location"
                  type="text"
                  required
                  value={programData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Salle principale pavillon"
                />
              </div>
            </div>
          </Card>

          {/* Intervenant */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervenant</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prog-speaker" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'Intervenant *
                  </label>
                  <input
                    id="prog-speaker"
                    type="text"
                    required
                    value={programData.speaker}
                    onChange={(e) => handleChange('speaker', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Dr. Marie Dubois"
                  />
                </div>

                <div>
                  <label htmlFor="prog-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise *
                  </label>
                  <input
                    id="prog-company"
                    type="text"
                    required
                    value={programData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Port Tech Institute"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-purple-600" />
                Tags et Mots-clés
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="prog-tags-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags associés
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {programData.tags.map((tag, index) => (
                      <Badge key={`tag-${tag}-${index}`} variant="default" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          aria-label={`Supprimer le tag ${tag}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      id="prog-tags-input"
                      type="text"
                      placeholder="Ajouter un tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement | null;
                        if (input) {
                          addTag(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link to={ROUTES.ADMIN_PAVILIONS}>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Ajouter le Programme
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
