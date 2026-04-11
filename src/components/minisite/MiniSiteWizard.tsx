import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SupabaseService } from '../../services/supabaseService';
import AiAgentService from '../../services/aiAgentService';
import { validateUrl, extractDomain } from '../../utils/urlValidator';
import { MiniSitePreviewModal } from './MiniSitePreviewModal';
import { AlertCircle, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useTranslation } from 'react-i18next';

interface MiniSiteWizardProps {
  onSuccess?: () => void;
}

export default function MiniSiteWizard({ onSuccess }: MiniSiteWizardProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const steps = [
    { label: t('minisite.step_company'), key: 'company', type: 'text', placeholder: t('minisite.placeholder_company') },
    { label: t('minisite.step_logo'), key: 'logo', type: 'file', placeholder: '' },
    { label: t('minisite.step_description'), key: 'description', type: 'textarea', placeholder: t('minisite.placeholder_description') },
    { label: t('minisite.step_documents'), key: 'documents', type: 'file', multiple: true, placeholder: '' },
    { label: t('minisite.step_products'), key: 'products', type: 'textarea', placeholder: t('minisite.placeholder_products') },
    { label: t('minisite.step_socials'), key: 'socials', type: 'text', placeholder: t('minisite.placeholder_socials') },
  ];
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files, type } = e.target as any;
    if (type === 'file') {
      setForm({ ...form, [name]: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNext = () => {
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  
  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  // Validation de l'URL en temps réel
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImportUrl(url);
    setUrlError(null);
    
    if (url.trim().length > 0) {
      const validation = validateUrl(url);
      if (!validation.isValid) {
        setUrlError(validation.error || t('minisite.invalid_url'));
      }
    }
  };

  // Génération automatique avec prévisualisation
  const handleAutoGenerate = async () => {
    setError(null);
    setUrlError(null);

    // Valider l'URL
    const validation = validateUrl(importUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || t('minisite.invalid_url'));
      return;
    }

    setLoading(true);
    
    try {
      // Domain extraction (used in error messages below via extractDomain)
      
      // Appel au service de scraping
      const generated = await AiAgentService.generate(validation.normalizedUrl || importUrl);
      
      // Stocker les données scrapées
      setScrapedData(generated);
      
      // Afficher la prévisualisation
      setShowPreview(true);
      
    } catch (aiError: any) {
      console.error('❌ Erreur agent IA:', aiError);
      
      // Messages d'erreur plus explicites
      if (aiError.message?.includes('timeout')) {
        setError(t('minisite.timeout_error', { domain: extractDomain(importUrl) }));
      } else if (aiError.message?.includes('404') || aiError.message?.includes('Fetch failed')) {
        setError(t('minisite.not_accessible_error', { domain: extractDomain(importUrl) }));
      } else if (aiError.message?.includes('Agent IA indisponible')) {
        setError(t('minisite.ai_unavailable'));
      } else {
        setError(t('minisite.fetch_error', { message: aiError.message || t('minisite.unknown_error') }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirmation de création depuis la prévisualisation
  const handleConfirmCreation = async () => {
    if (!scrapedData) return;
    
    setIsCreating(true);
    setError(null);

    try {
      // Préparation des données pour la création du mini-site
      const miniSiteData = {
        theme: scrapedData.theme || 'modern',
        company: scrapedData.company || t('minisite.default_company'),
        logo: scrapedData.logo || '',
        description: scrapedData.description || '',
        products: Array.isArray(scrapedData.products) ? scrapedData.products : [],
        socials: Array.isArray(scrapedData.socials) ? scrapedData.socials : [],
        documents: scrapedData.documents || [],
        sections: scrapedData.sections || [],
        contact: scrapedData.contact || {}
      };


      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error(t('minisite.login_required'));
      }

      // CRITICAL FIX: Récupérer l'exhibitorId depuis le profil utilisateur
      let exhibitorId = user.id; // Fallback au userId
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (exhibitor?.id) {
          exhibitorId = exhibitor.id;
        }
      } catch (err) {
        console.warn('Utilisation du userId comme exhibitorId:', err);
      }

      // Création du mini-site avec l'exhibitorId correct
      await SupabaseService.createMiniSite(exhibitorId, miniSiteData);

      // Publication automatique
      try {
        await SupabaseService.updateMiniSite(exhibitorId, {
          published: true
        });
      } catch (pubErr) {
        console.warn('⚠️ Impossible de publier automatiquement:', pubErr);
      }

      setSuccess(true);
      setShowPreview(false);
      if (onSuccess) onSuccess();
      
    } catch (e: any) {
      console.error('❌ Erreur création mini-site:', e);
      setError(e?.message || t('minisite.creation_error'));
      setShowPreview(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Édition des données depuis la prévisualisation
  const handleEditFromPreview = () => {
    // Pré-remplir le formulaire avec les données scrapées
    if (scrapedData) {
      setForm({
        company: scrapedData.company || '',
        description: scrapedData.description || '',
        products: Array.isArray(scrapedData.products) 
          ? scrapedData.products.map((p: any) => p.name).join('\n')
          : '',
        socials: Array.isArray(scrapedData.socials) 
          ? scrapedData.socials.join(', ')
          : ''
      });
    }
    setShowPreview(false);
    setStep(0); // Retour au début du formulaire manuel
  };

  // Soumission manuelle
  const handleManualSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const miniSiteData = {
        theme: form.theme || 'modern',
        company: form.company || t('minisite.default_company'),
        logo: form.logo || '',
        description: form.description || '',
        products: typeof form.products === 'string' ? form.products.split('\n').filter(Boolean) : [],
        socials: typeof form.socials === 'string' ? form.socials.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        documents: form.documents || [],
      };


      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error(t('minisite.login_required'));
      }

      // CRITICAL FIX: Récupérer l'exhibitorId depuis le profil utilisateur
      let exhibitorId = user.id; // Fallback au userId
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (exhibitor?.id) {
          exhibitorId = exhibitor.id;
        }
      } catch (err) {
        console.warn('Utilisation du userId comme exhibitorId:', err);
      }

      await SupabaseService.createMiniSite(exhibitorId, miniSiteData);

      // Publication automatique
      try {
        await SupabaseService.updateMiniSite(exhibitorId, {
          published: true
        });
      } catch (pubErr) {
        console.warn('⚠️ Publication automatique échouée:', pubErr);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();

    } catch (e: any) {
      console.error('❌ Erreur création mini-site:', e);
      setError(e?.message || t('minisite.creation_error'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">{t('minisite.success_emoji')}</div>
        <div className="text-lg font-bold mb-2">{t('minisite.success_title')}</div>
        <div className="text-gray-600 mb-4">{t('minisite.success_message')}</div>
        <a href="/minisite" target="_blank" rel="noopener noreferrer">
          <Button className="mb-2 w-full">{t('minisite.view_my_minisite')}</Button>
        </a>
        <Button variant="outline" onClick={onSuccess} className="w-full">{t('minisite.back_to_dashboard')}</Button>
      </Card>
    );
  }

  const current = steps[step];

  return (
    <>
      <Card className="max-w-lg mx-auto p-8 mt-8">
        <div className="mb-6 text-xl font-bold text-center">{t('minisite.wizard_title')}</div>
        
        {/* Mode automatique avec URL prioritaire */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block font-medium mb-2 text-blue-800">
            {t('minisite.auto_creation_title')}
          </label>
          <input 
            type="url" 
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 ${
              urlError ? 'border-red-500' : 'border-blue-300'
            }`}
            placeholder={t('minisite.placeholder_url')} 
            value={importUrl} 
            onChange={handleUrlChange}
            disabled={loading}
            data-testid="input-website-url"
          />
          {urlError && (
            <div className="flex items-start space-x-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{urlError}</span>
            </div>
          )}
          <div className="text-sm text-blue-600 mt-2">
            {t('minisite.ai_info')}
          </div>
          {importUrl && !urlError && (
            <Button 
              onClick={handleAutoGenerate} 
              disabled={loading} 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              data-testid="button-auto-generate"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{t('minisite.generating_auto')}</span>
                </span>
              ) : (
                t('minisite.auto_generate_button')
              )}
            </Button>
          )}
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-900">{t('minisite.error_title')}</div>
                <div className="text-sm text-red-700 mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mode manuel en option */}
        <div className="border-t pt-4">
          <div className="text-center text-gray-500 mb-4 text-sm">
            {t('minisite.manual_alternative')}
          </div>
          
          <form onSubmit={e => { e.preventDefault(); step === steps.length - 1 ? handleManualSubmit() : handleNext(); }}>
            <div className="mb-4">
              <label className="block font-medium mb-2">{current.label}</label>
              {current.type === 'text' && (
                <Input 
                  name={current.key} 
                  value={form[current.key] || ''} 
                  onChange={handleChange} 
                  placeholder={current.placeholder} 
                  required 
                  data-testid={`input-${current.key}`}
                />
              )}
              {current.type === 'textarea' && (
                <Textarea 
                  name={current.key} 
                  value={form[current.key] || ''} 
                  onChange={handleChange} 
                  placeholder={current.placeholder} 
                  required 
                  data-testid={`textarea-${current.key}`}
                />
              )}
              {current.type === 'file' && (
                <Input 
                  name={current.key} 
                  type="file" 
                  onChange={handleChange} 
                  multiple={current.multiple} 
                  data-testid={`file-${current.key}`}
                />
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrev} 
                disabled={step === 0 || loading}
                data-testid="button-previous"
              >
                {t('minisite.button_previous')}
              </Button>
              {step < steps.length - 1 ? (
                <Button type="submit" disabled={loading} data-testid="button-next">{t('minisite.button_next')}</Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  data-testid="button-manual-generate"
                >
                  {loading ? t('minisite.generating') : t('minisite.generate_button')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* Modal de prévisualisation */}
      {showPreview && scrapedData && (
        <MiniSitePreviewModal
          data={scrapedData}
          onConfirm={handleConfirmCreation}
          onEdit={handleEditFromPreview}
          onCancel={() => setShowPreview(false)}
          isCreating={isCreating}
        />
      )}
    </>
  );
}
