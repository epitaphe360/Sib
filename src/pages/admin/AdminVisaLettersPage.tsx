import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Clock, CheckCircle, XCircle,
  Search, Download, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── PDF helper (même logique que VisaLetterPage) ─────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: 'En attente',  bg: 'bg-amber-100',  text: 'text-amber-800',  icon: Clock         },
  approved: { label: 'Approuvée',   bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle   },
  rejected: { label: 'Refusée',     bg: 'bg-red-100',    text: 'text-red-800',    icon: XCircle       },
};

export default function AdminVisaLettersPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visa_letter_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error(t('common.load_error')); }
    else { setRequests((data as VisaRequest[]) || []); }
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  const handleApprove = async (req: VisaRequest) => {
    setProcessingId(req.id);
    const { error } = await supabase
      .from('visa_letter_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', req.id);

    if (error) {
      toast.error(t('admin.visa_approve_error'));
    } else {
      // Envoyer email via Edge Function
      await supabase.functions.invoke('send-template-email', {
        body: {
          to: req.user_email,
          subject: 'Votre lettre d\'invitation visa SIB 2026 a été approuvée',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B365D; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SIB 2026</h1>
              </div>
              <div style="padding: 32px; background: white;">
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                  <p style="margin: 0; color: #166534; font-weight: bold; font-size: 16px;">✅ Votre demande de lettre d'invitation a été approuvée !</p>
                </div>
                <p>Bonjour <strong>${req.first_name} ${req.last_name}</strong>,</p>
                <p>Votre lettre d'invitation officielle pour le <strong>Salon International du Bâtiment SIB 2026</strong> a été validée par notre équipe.</p>
                <p>Connectez-vous à votre espace visiteur pour télécharger la lettre PDF :</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${import.meta.env.VITE_APP_URL || 'https://sibevent.com'}/visitor/visa-letter"
                     style="background: #1B365D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Télécharger ma lettre
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Réf. demande : SIB2026-VISA-${req.id.slice(0, 6).toUpperCase()}</p>
                <p>Cordialement,<br><strong>L'équipe SIB 2026</strong></p>
              </div>
              <div style="background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
                Salon International du Bâtiment — El Jadida, 25-29 Novembre 2026
              </div>
            </div>
          `,
        },
      });

      toast.success(`${t('admin.visa_approved_msg')} ${req.user_email}`);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() } : r));
      setExpandedId(null);
    }
    setProcessingId(null);
  };

  const handleReject = async (req: VisaRequest) => {
    if (!rejectionReason.trim()) {
      toast.error(t('admin.visa_reject_reason_required'));
      return;
    }
    setProcessingId(req.id);
    const { error } = await supabase
      .from('visa_letter_requests')
      .update({ status: 'rejected', rejection_reason: rejectionReason.trim(), reviewed_at: new Date().toISOString() })
      .eq('id', req.id);

    if (error) {
      toast.error(t('admin.visa_reject_error'));
    } else {
      await supabase.functions.invoke('send-template-email', {
        body: {
          to: req.user_email,
          subject: 'Mise à jour de votre demande de lettre d\'invitation visa SIB 2026',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B365D; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SIB 2026</h1>
              </div>
              <div style="padding: 32px; background: white;">
                <p>Bonjour <strong>${req.first_name} ${req.last_name}</strong>,</p>
                <p>Après examen, nous ne sommes pas en mesure de donner suite à votre demande de lettre d'invitation visa.</p>
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 24px 0;">
                  <p style="margin: 0; color: #7f1d1d;"><strong>Motif :</strong> ${rejectionReason.trim()}</p>
                </div>
                <p>Pour toute question, contactez-nous à <a href="mailto:Sib2026@urbacom.net">Sib2026@urbacom.net</a>.</p>
                <p>Cordialement,<br><strong>L'équipe SIB 2026</strong></p>
              </div>
            </div>
          `,
        },
      });

      toast.success(`${t('admin.visa_rejected_msg')} ${req.user_email}`);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', rejection_reason: rejectionReason.trim() } : r));
      setExpandedId(null);
      setRejectionReason('');
    }
    setProcessingId(null);
  };

  const filtered = requests.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [r.first_name, r.last_name, r.user_email, r.passport_number, r.nationality]
      .some(v => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-sib-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="inline-flex items-center gap-2 text-sm text-sib-gray-500 hover:text-[#1B365D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back_dashboard')}
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2034]">{t('admin.visa_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('admin.visa_subtitle')}</p>
          </div>
          {counts.pending > 0 && (
            <span className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1.5 rounded-full">
              {counts.pending} {t('common.pending')}
            </span>
          )}
        </div>

        {/* Filtres + Search */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === s
                  ? 'bg-[#1B365D] text-white shadow'
                  : 'bg-white border text-gray-600 hover:border-[#1B365D]'
              }`}
            >
              {s === 'all' ? t('common.all_f') : s === 'pending' ? t('common.pending_status') : s === 'approved' ? t('common.approved_f') : t('common.rejected_f')} ({counts[s]})
            </button>
          ))}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-full text-sm focus:ring-2 focus:ring-[#1B365D] focus:outline-none"
              placeholder={t('admin.visa_search_ph')}
            />
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('common.no_results')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const cfg = STATUS_CONFIG[req.status];
              const Icon = cfg.icon;
              const isExpanded = expandedId === req.id;
              return (
                <Card key={req.id} className="overflow-hidden">
                  {/* Ligne principale */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    onKeyDown={e => e.key === 'Enter' && setExpandedId(isExpanded ? null : req.id)}
                  >
                    <div className={`p-2 rounded-full ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {req.first_name} {req.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{req.user_email}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {req.status === 'pending' ? t('common.pending_status') : req.status === 'approved' ? t('common.approved_f') : t('common.rejected_f')}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(req.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                  </div>

                  {/* Détails */}
                  {isExpanded && (
                    <div className="border-t px-4 py-5 bg-gray-50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-sm mb-5">
                        {[
                          [t('admin.visa_passport'), req.passport_number],
                          [t('admin.visa_nationality'), req.nationality],
                          [t('admin.visa_dob'), req.date_of_birth || '—'],
                          [t('admin.visa_organization'), req.organization || '—'],
                          [t('admin.visa_job_title'), req.job_title || '—'],
                          [t('admin.visa_address'), req.address || '—'],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                            <p className="font-medium text-gray-800">{value}</p>
                          </div>
                        ))}
                      </div>

                      {req.status === 'rejected' && req.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
                          <strong>{t('admin.visa_reject_reason')}:</strong> {req.rejection_reason}
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => { const doc = buildVisaPDF(req); doc.save(`visa_SIB2026_${req.last_name}.pdf`); }}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            <Download className="h-4 w-4 mr-1" /> {t('admin.visa_download_pdf')}
                          </Button>
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApprove(req)}
                              disabled={processingId === req.id}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {processingId === req.id ? t('common.processing') : t('common.approve')}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              placeholder={t('admin.visa_reject_reason_ph')}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                            />
                            <Button
                              onClick={() => handleReject(req)}
                              disabled={processingId === req.id || !rejectionReason.trim()}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm flex-shrink-0"
                            >
                              <XCircle className="h-4 w-4 mr-1" /> {t('common.reject')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
