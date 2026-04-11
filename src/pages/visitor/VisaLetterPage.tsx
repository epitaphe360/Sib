import { useState } from 'react';
import { ArrowLeft, FileText, Download, User, Globe, Calendar, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';

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

export default function VisaLetterPage() {
  const { user } = useAuthStore();
  const profile = user?.profile || {};

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
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generatePDF = () => {
    setGenerating(true);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Marges et dimensions
    const marginLeft = 25;
    const marginRight = 185;
    const pageWidth = marginRight - marginLeft;
    let y = 25;

    // --- En-tête ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // bleu
    doc.text('SALON INTERNATIONAL DU BÂTIMENT', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(13);
    doc.text('SIB 2026', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Mohammed VI Exhibition Center, Casablanca - 1-3 Avril 2026', 105, y, { align: 'center' });
    y += 3;
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.8);
    doc.line(marginLeft, y + 2, marginRight, y + 2);
    y += 12;

    // --- Titre lettre ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text("LETTRE D'INVITATION - FACILITATION VISA", 105, y, { align: 'center' });
    y += 10;

    // --- Date + référence ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const refNum = `SIB2026-VISA-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.text(`Casablanca, le ${dateStr}`, marginLeft, y);
    doc.text(`Réf. : ${refNum}`, marginRight, y, { align: 'right' });
    y += 12;

    // --- Corps principal ---
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);

    const fullName = `${form.firstName.toUpperCase()} ${form.lastName.toUpperCase()}`;
    const salutation = `Messieurs/Mesdames,`;

    doc.text(salutation, marginLeft, y);
    y += 8;

    const intro = `Nous avons l'honneur de vous informer que ${fullName} est officiellement invité(e) à participer au Salon International du Bâtiment SIB 2026, qui se tiendra du 1 au 3 avril 2026 au Mohammed VI Exhibition Center, Casablanca, Royaume du Maroc.`;
    const introLines = doc.splitTextToSize(intro, pageWidth);
    doc.text(introLines, marginLeft, y);
    y += introLines.length * 6 + 4;

    // --- Données participant ---
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(marginLeft, y, pageWidth, 52, 3, 3, 'F');
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INFORMATIONS DU PARTICIPANT', marginLeft + 4, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const fields = [
      ['Nom complet', fullName],
      ['Numéro de passeport', form.passportNumber || '-'],
      ['Nationalité', form.nationality || '-'],
      ['Date de naissance', form.dateOfBirth || '-'],
      ['Organisation', form.organization || '-'],
      ['Fonction', form.jobTitle || '-'],
    ];

    fields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label} :`, marginLeft + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, marginLeft + 60, y);
      y += 6;
    });

    y += 6;

    // --- Paragraphes invitation ---
    const paras = [
      `À cet égard, nous sollicitons auprès des autorités consulaires compétentes la délivrance d'un visa d'entrée au Royaume du Maroc pour le/la titulaire de ce document.`,
      `Le Salon International du Bâtiment SIB 2026 est le rendez-vous annuel incontournable du secteur de la construction et du bâtiment au Maroc et en Afrique. Il réunit décideurs, professionnels et experts internationaux pour trois jours de conférences, expositions et networking.`,
      `Tous les frais de déplacement, d'hébergement et de séjour sont à la charge du participant ou de son organisation.`,
      `Nous vous prions d'agréer, Messieurs/Mesdames, l'expression de nos salutations distinguées.`,
    ];

    paras.forEach((para) => {
      const lines = doc.splitTextToSize(para, pageWidth);
      doc.text(lines, marginLeft, y);
      y += lines.length * 6 + 4;
    });

    // --- Signature ---
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Comité d\'Organisation - SIB 2026', marginLeft, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Mohammed VI Exhibition Center, Casablanca, Maroc', marginLeft, y);
    y += 5;
    doc.text('contact@sib2026.ma  |  www.sib2026.ma', marginLeft, y);

    // --- Pied de page ---
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, 280, marginRight, 280);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Ce document est généré automatiquement par la plateforme SIB 2026. Il ne constitue pas une garantie d\'obtention de visa.', 105, 285, { align: 'center' });
    doc.text(`Référence : ${refNum} - Généré le ${dateStr}`, 105, 290, { align: 'center' });

    doc.save(`lettre_invitation_visa_SIB2026_${form.lastName.toLowerCase()}.pdf`);
    setGenerating(false);
    setGenerated(true);
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
            Générez votre lettre d'invitation officielle pour faciliter l'obtention de votre visa d'entrée au Maroc dans le cadre du SIB 2026.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À propos de ce document</p>
              <p>Cette lettre d'invitation est fournie à titre de facilitation pour vos démarches consulaires. Elle ne garantit pas l'obtention d'un visa. Présentez ce document à l'ambassade ou au consulat du Maroc compétent avec votre dossier de demande de visa.</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du participant</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />Prénom <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Prénom (tel que sur le passeport)"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />Nom <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nom (tel que sur le passeport)"
              />
            </div>

            {/* N° passeport */}
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

            {/* Nationalité */}
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

            {/* Date de naissance */}
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

            {/* Organisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation / Entreprise</label>
              <input
                name="organization"
                value={form.organization}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nom de votre entreprise"
              />
            </div>

            {/* Fonction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonction / Titre</label>
              <input
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ex: Directeur Général, Ingénieur..."
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse professionnelle</label>
              <input
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
              onClick={generatePDF}
              disabled={!isValid || generating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Download className="h-5 w-5 mr-2" />
              {generating ? 'Génération en cours...' : 'Télécharger la lettre PDF'}
            </Button>
          </div>

          {generated && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              Votre lettre d'invitation a été téléchargée avec succès. Joignez-la à votre dossier de demande de visa.
            </div>
          )}
        </Card>

        {/* Info dates */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">Dates</p>
            <p className="text-gray-500">1-3 Avril 2026</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">Lieu</p>
            <p className="text-gray-500">Mohammed VI Exhibition Center</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="font-semibold text-gray-700">Ville</p>
            <p className="text-gray-500">Casablanca, Maroc</p>
          </div>
        </div>
      </div>
    </div>
  );
}

