import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, User, Building, Phone, ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

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
  { id: 'tv', label: 'Télévision / Audiovisuel' },
  { id: 'radio', label: 'Radio' },
  { id: 'print', label: 'Presse Écrite' },
  { id: 'web', label: 'Presse Digitale / Web' },
  { id: 'agency', label: 'Agence de Presse' },
  { id: 'freelance', label: 'Journaliste Freelance / Blogueur' },
];

export default function PressAccreditationPage() {
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
          throw new Error('Table press_accreditations manquante');
        } else {
          throw error;
        }
      }

      setIsSuccess(true);
      toast.success('Demande d\'accréditation envoyée avec succès');
    } catch (err: any) {
      console.error('Erreur accréditation presse:', err);
      toast.error('Erreur lors de l\'envoi de la demande.');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande Reçue !</h2>
            <p className="text-gray-600 mb-6">
              Votre demande d'accréditation presse a été enregistrée avec succès. Notre équipe examinera votre dossier et vous contactera prochainement.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Retour à l'accueil
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-100 opacity-50 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Camera className="h-8 w-8 text-blue-600" />
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accréditation Presse - SIB 2026</h1>
          <p className="text-lg text-gray-600">
            Journalistes, reporters et professionnels des médias : demandez votre badge presse pour couvrir l'événement majeur du BTP en Afrique.
          </p>
        </div>

        <Card className="p-8 shadow-xl border-t-4 border-t-blue-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Informations Personnelles</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Prénom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Nom de famille"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
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

              {/* Informations professionnelles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Média & Profession</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Média *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.mediaName}
                      onChange={(e) => setForm({ ...form, mediaName: e.target.value })}
                      placeholder="Nom de l'organisation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de Média *</label>
                  <select
                    required
                    className="w-full h-12 bg-white border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.mediaType}
                    onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                  >
                    <option value="">Sélectionnez le type</option>
                    {MEDIA_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Fonction *</label>
                  <Input
                    required
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    placeholder="Journaliste, Rédacteur en chef..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays d'origine *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      className="pl-10"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="France, Maroc, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan de couverture SIB 2026 (Optionnel)</label>
              <textarea
                className="w-full bg-white border border-gray-300 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez brièvement comment vous prévoyez de couvrir l'événement (interviews, reportage sur place, etc.)"
                value={form.coveragePlan}
                onChange={(e) => setForm({ ...form, coveragePlan: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-900 mt-6">
              <Camera className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
              <div>
                <strong>Note importante :</strong> L'accréditation presse est strictement réservée aux professionnels des médias. Le comité d'organisation du SIB 2026 se réserve le droit d'accepter ou de refuser cette demande après vérification.
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : (
                <>Envoyer la demande d'accréditation <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

