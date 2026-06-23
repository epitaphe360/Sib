import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Download, User, Globe, Calendar, Hash, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface VisaFormData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  organization: string;
  jobTitle: string;
  address: string;
}

type Status = 'pending' | 'approved' | 'rejected';

interface VisaRequest {
  id: string;
  user_id: string;
  user_email: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string | null;
  organization: string | null;
  job_title: string | null;
  address: string | null;
  status: Status;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_CONFIG = {
  pending:  { label: 'En attente',  bg: 'bg-amber-100',  text: 'text-amber-800',  Icon: Clock       },
  approved: { label: 'Approuvée', bg: 'bg-green-100',  text: 'text-green-800',  Icon: CheckCircle },
  rejected: { label: 'Refusée',   bg: 'bg-red-100',    text: 'text-red-800',    Icon: XCircle     },
};

function buildVisaPDF(req: VisaRequest) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const marginLeft = 25;
  const marginRight = 185;
  const pageWidth = marginRight - marginLeft;
  const refNum = `SIB2026-VISA-${req.id.slice(0, 6).toUpperCase()}`;
  let y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text('SALON INTERNATIONAL DU BATIMENT', 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(13);
  doc.text('SIB 2026', 105, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text("Parc d'Exposition Mohammed VI, El Jadida - 25-29 Novembre 2026", 105, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, y + 2, marginRight, y + 2);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text("LETTRE D'INVITATION - FACILITATION VISA", 105, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`El Jadida, le ${dateStr}`, marginLeft, y);
  doc.text(`Ref. : ${refNum}`, marginRight, y, { align: 'right' });
  y += 12;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  const fullName = `${req.first_name.toUpperCase()} ${req.last_name.toUpperCase()}`;
  doc.text('Messieurs/Mesdames,', marginLeft, y);
  y += 8;

  const intro = `Nous avons l'honneur de vous informer que ${fullName} est officiellement invite(e) a participer au Salon International du Batiment SIB 2026, qui se tiendra du 25 au 29 novembre 2026 au Parc d'Exposition Mohammed VI, El Jadida, Royaume du Maroc.`;
  const introLines = doc.splitTextToSize(intro, pageWidth);
  doc.text(introLines, marginLeft, y);
  y += introLines.length * 6 + 4;

  doc.setFillColor(240, 245, 255);
  doc.roundedRect(marginLeft, y, pageWidth, 52, 3, 3, 'F');
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INFORMATIONS DU PARTICIPANT', marginLeft + 4, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const fields: [string, string][] = [
    ['Nom complet', fullName],
    ['Numero de passeport', req.passport_number],
    ['Nationalite', req.nationality],
    ['Date de naissance', req.date_of_birth || '-'],
    ['Organisation', req.organization || '-'],
    ['Fonction', req.job_title || '-'],
  ];
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, marginLeft + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginLeft + 60, y);
    y += 6;
  });
  y += 6;

  const paras = [
    "A cet egard, nous sollicitons aupres des autorites consulaires competentes la delivrance d'un visa d'entree au Royaume du Maroc pour le/la titulaire de ce document.",
    "Le Salon International du Batiment SIB 2026 est le rendez-vous annuel incontournable du secteur de la construction et du batiment au Maroc et en Afrique.",
    "Tous les frais de deplacement, d'hebergement et de sejour sont a la charge du participant ou de son organisation.",
    "Nous vous prions d'agreer, Messieurs/Mesdames, l'expression de nos salutations distinguees.",
  ];
  paras.forEach((para) => {
    const lines = doc.splitTextToSize(para, pageWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * 6 + 4;
  });

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text("Comite d'Organisation - SIB 2026", marginLeft, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('URBACOM - 63, Imm B, Res LE YACHT, Bd de la Corniche 7eme etage N185, Casablanca 20510', marginLeft, y);
  y += 5;
  doc.text('Sib2026@urbacom.net  |  www.sibevent.com', marginLeft, y);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(marginLeft, 280, marginRight, 280);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Ce document est valide et approuve par le Comite d'Organisation SIB 2026.", 105, 285, { align: 'center' });
  doc.text(`Reference : ${refNum} - Genere le ${dateStr}`, 105, 290, { align: 'center' });

  return doc;
}

const emptyForm: VisaFormData = {
  firstName: '', lastName: '', passportNumber: '', nationality: '',
  dateOfBirth: '', organization: '', jobTitle: '', address: '',
};

export default function VisaLetterPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = (user?.profile || {}) as Record<string, unknown>;

  const [requests, setRequests] = useState<VisaRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<VisaFormData>({
    ...emptyForm,
    firstName: (profile.firstName as string) || '',
    lastName: (profile.lastName as string) || '',
    nationality: (profile.country as string) || '',
    organization: (profile.companyName as string) || '',
    jobTitle: (profile.position as string) || '',
  });

  const fetchRequests = useCallback(async () => {
    if (!user?.id) { return; }
    setLoadingRequests(true);
    const { data, error } = await (supabase as any)
      .from('visa_letter_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { toast.error(t('common.load_error')); }
    else { setRequests(data || []); }
    setLoadingRequests(false);
  }, [user, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from('visa_letter_requests').insert({
      user_id: user.id,
      user_email: user.email || '',
      first_name: form.firstName,
      last_name: form.lastName,
      passport_number: form.passportNumber,
      nationality: form.nationality,
      date_of_birth: form.dateOfBirth || null,
      organization: form.organization || null,
      job_title: form.jobTitle || null,
      address: form.address || null,
      status: 'pending',
    });
    if (error) {
      toast.error(t('visa.submit_error') || 'Erreur lors de la soumission');
    } else {
      toast.success(t('visa.submit_success') || 'Demande envoyée — en attente de validation admin');
      setForm(emptyForm);
      setShowForm(false);
      fetchRequests();
    }
    setSubmitting(false);
  };

  const isValid = form.firstName && form.lastName && form.passportNumber && form.nationality;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={ROUTES.VISITOR_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('visa.back')}
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('visa.title')}</h1>
            <p className="mt-2 text-gray-600">{t('visa.subtitle')}</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t('visa.about_title')}</p>
              <p>{t('visa.about_text')}</p>
            </div>
          </div>
        </div>

        {showForm && (
          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('visa.participant_info')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />{t('visa.first_name')} <span className="text-red-500">*</span>
                  </label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t('visa.first_name_ph')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />{t('visa.last_name')} <span className="text-red-500">*</span>
                  </label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t('visa.last_name_ph')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Hash className="inline h-4 w-4 mr-1" />{t('visa.passport_number')} <span className="text-red-500">*</span>
                  </label>
                  <input name="passportNumber" value={form.passportNumber} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: AB1234567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="inline h-4 w-4 mr-1" />{t('visa.nationality')} <span className="text-red-500">*</span>
                  </label>
                  <input name="nationality" value={form.nationality} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Française, Sénégalaise..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />{t('visa.birth_date')}
                  </label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('visa.organization')}</label>
                  <input name="organization" value={form.organization} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nom de votre entreprise" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('visa.job_title')}</label>
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Directeur Général, Ingénieur..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('visa.address')}</label>
                  <input name="address" value={form.address} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ville, Pays" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Annuler
                </Button>
                <Button type="submit" disabled={!isValid || submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Envoi en cours...' : 'Soumettre la demande'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes demandes</h2>
          {loadingRequests ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>Aucune demande pour l&apos;instant.</p>
              <p className="text-sm mt-1">Cliquez sur &quot;Nouvelle demande&quot; pour soumettre votre dossier.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => {
                const cfg = STATUS_CONFIG[req.status];
                return (
                  <Card key={req.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900">{req.first_name} {req.last_name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Passeport : {req.passport_number} · {req.nationality}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Soumise le {new Date(req.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        {req.status === 'rejected' && req.rejection_reason && (
                          <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-1.5 rounded">
                            Motif : {req.rejection_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
                          <cfg.Icon className="h-4 w-4" />
                          {cfg.label}
                        </span>
                        {req.status === 'approved' && (
                          <Button
                            onClick={() => {
                              const doc = buildVisaPDF(req);
                              doc.save(`lettre_visa_SIB2026_${req.last_name.toLowerCase()}.pdf`);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">{t('visa.dates')}</p>
            <p className="text-gray-500">25-29 Novembre 2026</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">{t('visa.venue')}</p>
            <p className="text-gray-500">Parc d&apos;Exposition Mohammed VI</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">{t('visa.city')}</p>
            <p className="text-gray-500">El Jadida, Maroc</p>
          </div>
        </div>
      </div>
    </div>
  );
}

