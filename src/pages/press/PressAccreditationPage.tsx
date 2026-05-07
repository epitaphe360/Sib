import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, User, Building, Phone, ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';

interface PressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mediaName: string;
  mediaType: string;
  jobTitle: string;
  country: string;
  coveragePlan: string;
}

const MEDIA_TYPES = [
  { id: 'tv', label: 'Television / Audiovisuel' },
  { id: 'radio', label: 'Radio' },
  { id: 'print', label: 'Presse Ecrite' },
  { id: 'web', label: 'Presse Digitale / Web' },
  { id: 'agency', label: 'Agence de Presse' },
  { id: 'freelance', label: 'Journaliste Freelance / Blogueur' },
];

export default function PressAccreditationPage() {
  const { t } = useTranslation();
  const mediaTypeLabels: Record<string, string> = {
    tv: t('press.media_tv'),
    radio: t('press.media_radio'),
    print: t('press.media_print'),
    web: t('press.media_web'),
    agency: t('press.media_agency'),
    freelance: t('press.media_freelance'),
  };
  const [form, setForm] = useState<PressForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mediaName: '',
    mediaType: '',
    jobTitle: '',
    country: '',
    coveragePlan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('press_accreditations').insert([
        {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          media_name: form.mediaName,
          media_type: form.mediaType,
          job_title: form.jobTitle,
          country: form.country,
          coverage_plan: form.coveragePlan,
          status: 'pending',
        },
      ]);
      if (error) {
        if (error.code === '42P01') {
          throw new Error(t('press.submit_error'));
        } else {
          throw error;
        }
      }

      setIsSuccess(true);
      toast.success(t('press.submit_success'));
    } catch (err: any) {
      console.error('Erreur accreditation presse:', err);
      toast.error(t('press.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('press.received_title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('press.received_desc')}
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              {t('press.back_home')}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-100 opacity-50 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <Camera className="h-8 w-8 text-indigo-600" />
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('press.title')}</h1>
          <p className="text-lg text-gray-600">
            {t('press.subtitle')}
          </p>
        </div>

        <Card className="p-8 shadow-xl border-t-4 border-t-blue-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">{t('press.personal_info')}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.first_name')} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder={t('press.first_name_ph')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.last_name')} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder={t('press.last_name_ph')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.email_pro')} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      required
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@media.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.phone')} *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+212 600 000 000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">{t('press.media_profession')}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.media_name')} *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.mediaName}
                      onChange={(e) => setForm({ ...form, mediaName: e.target.value })}
                      placeholder={t('press.media_name_ph')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.media_type_label')} *</label>
                  <select
                    required
                    className="w-full h-12 bg-white border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.mediaType}
                    onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                  >
                    <option value="">{t('common.select')}</option>
                    {MEDIA_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{mediaTypeLabels[type.id] ?? type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.job_title')} *</label>
                  <Input
                    required
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    placeholder={t('press.job_title_ph')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.country_origin')} *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder={t('press.country_ph')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('press.coverage_plan')}</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder={t('press.coverage_plan_ph')}
                value={form.coveragePlan}
                onChange={(e) => setForm({ ...form, coveragePlan: e.target.value })}
              />
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 text-sm text-indigo-900 mt-6">
              <Camera className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" />
              <div>
                <strong>{t('press.important_note_title')}</strong> {t('press.important_note')}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('press.submitting') : (
                <>{t('press.submit')} <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}