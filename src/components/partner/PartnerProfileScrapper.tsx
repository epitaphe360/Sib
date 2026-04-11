import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import aiScrapperService from '../../services/aiScrapperService';
import { SupabaseService } from '../../services/supabaseService';

interface PartnerProfileScrapperProps {
  partnerId: string;
  onSuccess?: () => void;
}

export default function PartnerProfileScrapper({ partnerId, onSuccess }: PartnerProfileScrapperProps) {
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
    const loadingToast = toast.loading('🤖 Analyse de votre site web avec l\'IA...');

    try {
      const result = await aiScrapperService.scrapPartnerProfile(websiteUrl);

      toast.dismiss(loadingToast);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Impossible d\'analyser le site web');
        return;
      }

      setScrapResult(result.data);
      setStep('preview');
      toast.success('✨ Profil extrait avec succès! Vérifiez et sauvegardez.');

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Erreur lors du scrapping');
      console.error('Scrapping error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scrapResult) return;

    setIsLoading(true);
    const savingToast = toast.loading('💾 Sauvegarde du profil...');

    try {
      // Sauvegarder dans la table partners via SupabaseService
      await SupabaseService.updatePartner(partnerId, {
        company_name: scrapResult.companyName,
        description: scrapResult.description,
        sector: scrapResult.sector,
        logo_url: scrapResult.logoUrl || undefined,
        website: websiteUrl,
        contact_info: {
          email: scrapResult.contactEmail,
          phone: scrapResult.contactPhone,
          address: scrapResult.address,
          social: scrapResult.socialLinks
        },
        // Champs additionnels
        services: scrapResult.services || [],
        founded_year: scrapResult.foundedYear,
        employee_count: scrapResult.employeeCount
      });

      toast.dismiss(savingToast);
      toast.success('✅ Profil sauvegardé avec succès!');
      setStep('saved');

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      toast.dismiss(savingToast);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (field: string, value: any) => {
    setScrapResult({ ...scrapResult, [field]: value });
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Remplissage Automatique par IA
                </h3>
                <p className="text-gray-600">
                  Notre IA va analyser votre site web et extraire automatiquement les informations
                  de votre entreprise pour compléter votre profil.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL de votre site web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://votre-entreprise.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 L'IA va extraire: nom, description, secteur, services, contact, etc.
                </p>
              </div>

              <Button
                onClick={handleScrap}
                disabled={isLoading || !websiteUrl.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyser avec l'IA
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Assurez-vous que votre site web est accessible publiquement</li>
                  <li>Les informations extraites seront modifiables avant sauvegarde</li>
                  <li>Le processus prend généralement 10-30 secondes</li>
                </ul>
              </div>
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
                <h3 className="font-bold text-green-900">Extraction réussie!</h3>
                <p className="text-sm text-green-700">Vérifiez et modifiez les informations si nécessaire</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                value={scrapResult.companyName || ''}
                onChange={(e) => handleEdit('companyName', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={scrapResult.description || ''}
                onChange={(e) => handleEdit('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Secteur */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Secteur d'activité</label>
              <input
                type="text"
                value={scrapResult.sector || ''}
                onChange={(e) => handleEdit('sector', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Services offerts</label>
              <div className="space-y-2">
                {scrapResult.services?.map((service: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={scrapResult.contactEmail || ''}
                  onChange={(e) => handleEdit('contactEmail', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={scrapResult.contactPhone || ''}
                  onChange={(e) => handleEdit('contactPhone', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Sauvegarder le profil
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
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Profil sauvegardé!</h3>
          <p className="text-gray-600 mb-6">
            Votre profil partenaire a été mis à jour avec succès
          </p>
          <Button
            onClick={() => setStep('input')}
            variant="outline"
            className="rounded-xl"
          >
            Analyser un autre site
          </Button>
        </motion.div>
      )}
    </div>
  );
}
