import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SupabaseService } from '../../services/supabaseService';
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
      if (onSuccess) {onSuccess();}

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
    </>
  );
}
