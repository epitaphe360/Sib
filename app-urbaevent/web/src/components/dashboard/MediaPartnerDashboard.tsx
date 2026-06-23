import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic2, Badge, Calendar, BookOpen, Camera, AlertTriangle,
  CheckCircle, Clock, Newspaper, Download, LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { DynamicBadge } from '../badge/DynamicBadge';
import { DEFAULT_SALON_CONFIG } from '../../config/salonInfo';

const PRESS_SECTIONS = [
  { id: 'programme', label: 'Programme', icon: Calendar, desc: 'Consultez le programme complet du salon SIB 2026' },
  { id: 'dossier', label: 'Dossier de presse', icon: BookOpen, desc: 'Téléchargez le dossier de presse officiel' },
  { id: 'photos', label: 'Médiathèque', icon: Camera, desc: 'Accédez aux photos et visuels en haute définition' },
  { id: 'actu', label: 'Communiqués', icon: Newspaper, desc: 'Retrouvez tous les communiqués de presse' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<{className?: string}> }> = {
  pending_review: { label: 'En cours de validation', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock },
  approved:       { label: 'Accréditation approuvée', color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle },
  rejected:       { label: 'Accréditation refusée', color: 'bg-red-50 border-red-200 text-red-700', icon: AlertTriangle },
};

export default function MediaPartnerDashboard() {
  const { user, logout } = useAuthStore();
  const [partnerData, setPartnerData] = useState<any>(null);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!user?.id) {return;}
    (supabase as any)
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }: any) => setPartnerData(data));
  }, [user]);

  const status = partnerData?.status || 'pending_review';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header rouge */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white px-6 py-5 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <Mic2 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-lg">{partnerData?.organization_name || 'Sponsor Média'}</div>
              <div className="text-red-200 text-sm">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Statut accréditation */}
        <div className={`flex items-center gap-3 border rounded-xl p-4 ${statusCfg.color}`}>
          <StatusIcon className="h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">{statusCfg.label}</div>
            {status === 'pending_review' && (
              <div className="text-sm opacity-80">Votre dossier est en cours d'examen. Réponse sous 48h ouvrées.</div>
            )}
            {status === 'approved' && (
              <div className="text-sm opacity-80">Accès complet à l'espace presse pendant toute la durée du salon.</div>
            )}
            {status === 'rejected' && partnerData?.admin_note && (
              <div className="text-sm opacity-80">Motif : {partnerData.admin_note}</div>
            )}
          </div>
        </div>

        {/* Badge (si approuvé) */}
        {status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900 to-red-700 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-red-200 mb-1">Votre accréditation</div>
                <div className="text-2xl font-bold">Badge Sponsor Média</div>
                <div className="text-red-200 text-sm mt-1">Accès Salle de Presse + Toutes zones exposants</div>
              </div>
              <button
                onClick={() => setShowBadge(true)}
                className="flex items-center gap-2 bg-white text-red-800 hover:bg-red-50 px-5 py-3 rounded-xl font-bold text-sm transition"
              >
                <Badge className="h-4 w-4" />
                Afficher mon badge
              </button>
            </div>
          </motion.div>
        )}

        {/* Info salon */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Informations Salon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1">Dates</div>
              <div className="font-semibold text-gray-900">25 – 29 Novembre 2026</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1">Lieu</div>
              <div className="font-semibold text-gray-900">OFEC — Casablanca</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1">Accréditation</div>
              <div className="font-semibold text-red-700">Sponsor Média 🎙️</div>
            </div>
          </div>
        </div>

        {/* Accès salle de presse (si approuvé) */}
        {status === 'approved' && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Espace Presse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESS_SECTIONS.map(section => (
                <motion.div
                  key={section.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 p-2.5 rounded-xl shrink-0">
                      <section.icon className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{section.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{section.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Contact organisateurs */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-sm text-red-800">
          <strong>Contact organisateurs :</strong> Pour toute question relative à votre accréditation, contactez{' '}
          <a href="mailto:presse@sib2026.ma" className="underline">presse@sib2026.ma</a>
        </div>
      </div>

      {/* Modal Badge */}
      {showBadge && (
        <DynamicBadge
          user={user}
          onClose={() => setShowBadge(false)}
          overrideRole="media_partner"
          overrideCompany={partnerData?.organization_name}
        />
      )}
    </div>
  );
}
