import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, CheckCircle, AlertCircle, Loader2, Package, Users, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import aiScrapperService from '../../services/aiScrapperService';
import { SupabaseService } from '../../services/supabaseService';

interface ExhibitorMiniSiteScrapperProps {
  exhibitorId: string;
  userId: string;
  onSuccess?: () => void;
}

export default function ExhibitorMiniSiteScrapper({ exhibitorId, userId, onSuccess }: ExhibitorMiniSiteScrapperProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapResult, setScrapResult] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'preview' | 'saved'>('input');

  const handleScrap = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Veuillez entrer l\'URL de votre site web');
      return;
    }

    // Valider l'URL
    try {
      new URL(websiteUrl);
    } catch {
      toast.error('URL invalide. Format: https://exemple.com');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('🤖 Création de votre mini-site avec l\'IA...');

    try {
      const result = await aiScrapperService.scrapExhibitorMiniSite(websiteUrl);

      toast.dismiss(loadingToast);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Impossible d\'analyser le site web');
        return;
      }

      setScrapResult(result.data);
      setStep('preview');
      toast.success('✨ Mini-site créé avec succès! Vérifiez et publiez.');

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Erreur lors de la création');
      console.error('Scrapping error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scrapResult) return;

    setIsLoading(true);
    const savingToast = toast.loading('💾 Publication du mini-site...');

    try {
      // Créer ou mettre à jour le mini-site
      const miniSiteData = {
        exhibitor_id: userId,
        theme: 'default',
        custom_colors: {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#3b82f6'
        },
        sections: {
          hero: {
            title: scrapResult.companyName,
            subtitle: scrapResult.tagline,
            backgroundImage: scrapResult.gallery?.[0] || null
          },
          about: {
            description: scrapResult.description,
            mission: 'Notre mission',
            vision: 'Notre vision',
            values: ['Excellence', 'Innovation', 'Qualité']
          },
          products: scrapResult.products || [],
          services: scrapResult.services || [],
          achievements: scrapResult.achievements || [],
          team: scrapResult.teamMembers || [],
          contact: scrapResult.contactInfo || {},
          gallery: scrapResult.gallery || []
        },
        is_published: true
      };

      // Vérifier si un mini-site existe déjà
      const existingMiniSite = await SupabaseService.getMiniSiteByExhibitorId(userId);

      if (existingMiniSite) {
        // Mettre à jour
        await SupabaseService.updateMiniSite(existingMiniSite.id, miniSiteData);
      } else {
        // Créer
        await SupabaseService.createMiniSite(miniSiteData);
      }

      toast.dismiss(savingToast);
      toast.success('✅ Mini-site publié avec succès!');
      setStep('saved');

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      toast.dismiss(savingToast);
      toast.error(error.message || 'Erreur lors de la publication');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-purple-600 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Création Automatique de Mini-Site par IA
                </h3>
                <p className="text-gray-600">
                  Notre IA va analyser votre site web et créer automatiquement un mini-site professionnel
                  avec vos produits, services, équipe et réalisations.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL de votre site web d'entreprise
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://votre-entreprise.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 L'IA va extraire: produits, services, équipe, réalisations, galerie, contact
                </p>
              </div>

              <Button
                onClick={handleScrap}
                disabled={isLoading || !websiteUrl.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-bold rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Créer mon Mini-Site avec l'IA
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-bold text-gray-900 mb-1">Produits & Services</h4>
              <p className="text-xs text-gray-600">Extraction automatique de votre catalogue</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-bold text-gray-900 mb-1">Équipe</h4>
              <p className="text-xs text-gray-600">Profils des membres clés</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Award className="h-8 w-8 text-amber-600 mb-2" />
              <h4 className="font-bold text-gray-900 mb-1">Réalisations</h4>
              <p className="text-xs text-gray-600">Vos succès et projets phares</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'preview' && scrapResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-bold text-green-900">Mini-site créé!</h3>
                <p className="text-sm text-green-700">Vérifiez le contenu et publiez</p>
              </div>
            </div>
          </Card>

          {/* Aperçu du mini-site */}
          <Card className="p-6 space-y-6 bg-white">
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="text-2xl font-bold text-gray-900">{scrapResult.companyName}</h3>
              <p className="text-purple-600 font-semibold">{scrapResult.tagline}</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">À propos</h4>
              <p className="text-gray-700">{scrapResult.description}</p>
            </div>

            {scrapResult.products && scrapResult.products.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Produits & Services ({scrapResult.products.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scrapResult.products.slice(0, 4).map((product: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-bold text-gray-900">{product.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-purple-600 font-semibold">{product.category}</span>
                        {product.price && (
                          <span className="text-xs text-gray-500">{product.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scrapResult.achievements && scrapResult.achievements.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-600" />
                  Réalisations
                </h4>
                <ul className="space-y-2">
                  {scrapResult.achievements.map((achievement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scrapResult.teamMembers && scrapResult.teamMembers.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Équipe
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scrapResult.teamMembers.map((member: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h5 className="font-bold text-gray-900">{member.name}</h5>
                      <p className="text-sm text-purple-600">{member.position}</p>
                      <p className="text-xs text-gray-600 mt-1">{member.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex space-x-4">
            <Button
              onClick={() => setStep('input')}
              variant="outline"
              className="flex-1 py-3 rounded-xl"
              disabled={isLoading}
            >
              Recommencer
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Publier le Mini-Site
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'saved' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Mini-site publié!</h3>
          <p className="text-gray-600 mb-6">
            Votre mini-site est maintenant accessible aux visiteurs du salon
          </p>
          <Button
            onClick={() => setStep('input')}
            variant="outline"
            className="rounded-xl"
          >
            Créer un autre mini-site
          </Button>
        </motion.div>
      )}
    </div>
  );
}
