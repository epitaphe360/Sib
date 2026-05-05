import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, User, Globe, Calendar, Hash, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
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

interface VisaRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string | null;
  organization: string | null;
  job_title: string | null;
  address: string | null;
}

function buildVisaPDF(data: {
  firstName: string; lastName: string; passportNumber: string; nationality: string;
  dateOfBirth: string; organization: string; jobTitle: string;
}, userId: string, refNum: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const marginLeft = 25;
  const marginRight = 185;
  const pageWidth = marginRight - marginLeft;
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
  const fullName = `${data.firstName.toUpperCase()} ${data.lastName.toUpperCase()}`;
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
    ['Numero de passeport', data.passportNumber || '-'],
    ['Nationalite', data.nationality || '-'],
    ['Date de naissance', data.dateOfBirth || '-'],
    ['Organisation', data.organization || '-'],
    ['Fonction', data.jobTitle || '-'],
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

export default function VisaLetterPage() {
  const { user } = useAuthStore();
  const profile = user?.profile || {};

  const [existingRequest, setExistingRequest] = useState<VisaRequest | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [form, setForm] = useState<VisaFormData>({
    firstName: (profile.firstName as string) || '',
    lastName: (profile.lastName as string) || '',
    passportNumber: '',
    nationality: (profile.country as string) || '',
    dateOfBirth: '',
    organization: (profile.companyName as string) || '',
    jobTitle: (profile.position as string) || '',
    address: '',
  });

  useEffect(() => {
    if (!user?.id) { return; }
    supabase
      .from('visa_letter_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error(error); }
        setExistingRequest(data ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!user?.id || !user?.email) { return; }
    setSubmitting(true);
    const { data, error } = await supabase.from('visa_letter_requests').insert({
      user_id: user.id,
      user_email: user.email,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      passport_number: form.passportNumber.trim(),
      nationality: form.nationality.trim(),
      date_of_birth: form.dateOfBirth || null,
      organization: form.organization.trim() || null,
      job_title: form.jobTitle.trim() || null,
      address: form.address.trim() || null,
      status: 'pending',
    }).select().single();

    if (error) {
      toast.error('Erreur lors de la soumission. Veuillez réessayer.');
      console.error(error);
    } else {
      setExistingRequest(data as VisaRequest);
      toast.success('Demande envoyée ! Vous serez notifié par email une fois validée.');
    }
    setSubmitting(false);
  };

  const handleDownloadPDF = () => {
    if (existingRequest?.status !== 'approved') { return; }
    setDownloading(true);
    const refNum = `SIB2026-VISA-${existingRequest.id.slice(0, 6).toUpperCase()}`;
    const doc = buildVisaPDF({
      firstName: existingRequest.first_name,
      lastName: existingRequest.last_name,
      passportNumber: existingRequest.passport_number,
      nationality: existingRequest.nationality,
      dateOfBirth: existingRequest.date_of_birth || '',
      organization: existingRequest.organization || '',
      jobTitle: existingRequest.job_title || '',
    }, user?.id || '', refNum);
    doc.save(`lettre_invitation_visa_SIB2026_${existingRequest.last_name.toLowerCase()}.pdf`);
    setDownloading(false);
    toast.success('Lettre téléchargée avec succès.');
  };

  const isValid = form.firstName && form.lastName && form.passportNumber && form.nationality;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={ROUTES.VISITOR_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lettre d'invitation visa</h1>
          <p className="mt-2 text-gray-600">
            Soumettez votre demande. L'équipe SIB 2026 la validera et vous recevrez la lettre officielle par email.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}

        {!loading && existingRequest ? (
          /* ── Demande existante ── */
          <Card className="p-8">
            {existingRequest.status === 'pending' && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="p-4 bg-amber-50 rounded-full">
                  <Clock className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Demande en cours de traitement</h2>
                <p className="text-gray-600 max-w-md">
                  Votre demande a été soumise le{' '}
                  <strong>{new Date(existingRequest.created_at).toLocaleDateString('fr-FR')}</strong>.
                  L'équipe SIB 2026 la traitera dans les plus brefs délais. Vous recevrez un email dès validation.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <Clock className="h-4 w-4" /> En attente de validation
                </span>
              </div>
            )}

            {existingRequest.status === 'approved' && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="p-4 bg-green-50 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lettre approuvée !</h2>
                <p className="text-gray-600 max-w-md">
                  Votre lettre d'invitation officielle a été validée par l'équipe SIB 2026. Téléchargez-la ci-dessous.
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {downloading ? 'Préparation...' : 'Télécharger la lettre PDF'}
                </Button>
              </div>
            )}

            {existingRequest.status === 'rejected' && (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="p-4 bg-red-50 rounded-full">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Demande refusée</h2>
                {existingRequest.rejection_reason && (
                  <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 text-left">
                    <strong>Motif :</strong> {existingRequest.rejection_reason}
                  </div>
                )}
                <p className="text-gray-500 text-sm">
                  Pour toute question, contactez <a href="mailto:Sib2026@urbacom.net" className="text-blue-600 underline">Sib2026@urbacom.net</a>.
                </p>
              </div>
            )}
          </Card>
        ) : null}

        {!loading && !existingRequest && (
          /* ── Formulaire ── */
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Comment ça fonctionne ?</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Remplissez le formulaire ci-dessous</li>
                    <li>L'équipe SIB valide votre demande (sous 48h)</li>
                    <li>Vous recevez la lettre officielle par email + disponible ici</li>
                  </ol>
                </div>
              </div>
            </div>

            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du participant</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tel que sur le passeport"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tel que sur le passeport"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Hash className="inline h-4 w-4 mr-1" />N° de passeport <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="passportNumber"
                    value={form.passportNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: AB1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="inline h-4 w-4 mr-1" />Nationalité <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Française, Sénégalaise..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">Organisation / Entreprise</label>
                  <input
                    id="organization"
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Fonction / Titre</label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Directeur Général, Ingénieur..."
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse professionnelle</label>
                  <input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ville, Pays"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {submitting ? 'Envoi en cours...' : 'Soumettre ma demande'}
                </Button>
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-white rounded-lg p-4 border">
                <p className="font-semibold text-gray-700">Dates</p>
                <p className="text-gray-500">25-29 Novembre 2026</p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <p className="font-semibold text-gray-700">Lieu</p>
                <p className="text-gray-500">Parc d'Exposition Mohammed VI</p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <p className="font-semibold text-gray-700">Ville</p>
                <p className="text-gray-500">El Jadida, Maroc</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
