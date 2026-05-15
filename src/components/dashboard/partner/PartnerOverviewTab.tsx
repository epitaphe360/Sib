import { Network, Brain, ArrowRight, ScanLine, UserPlus, Calendar } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

export function PartnerOverviewTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-10">

      {/* Actions rapides — Réseautage & Matching IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#1B365D] to-[#0F2034] text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 rounded-xl">
                <Network className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t('partner.advanced_networking')}</h3>
            </div>
            <p className="text-sm text-blue-200 mb-5">{t('partner.advanced_networking_desc')}</p>
            <Link to={ROUTES.NETWORKING}>
              <Button className="w-full bg-white text-[#1B365D] hover:bg-blue-50 font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Network className="h-4 w-4" />
                {t('partner.access_networking')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#C9A84C] to-[#A88830] text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">{t('partner.ai_matching')}</h3>
            </div>
            <p className="text-sm text-amber-100 mb-5">{t('partner.ai_matching_desc')}</p>
            <Link to={ROUTES.ADVANCED_MATCHING}>
              <Button className="w-full bg-white text-[#A88830] hover:bg-amber-50 font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Brain className="h-4 w-4" />
                {t('partner.access_ai_matching')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#0F2034] to-[#1a3a5c] text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/15 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">Programme & Séminaires</h3>
            </div>
            <p className="text-sm text-blue-200 mb-5">Inscrivez-vous aux conférences et séminaires SIB 2026</p>
            <Link to={ROUTES.PARTNER_EVENTS}>
              <Button className="w-full bg-white text-[#0F2034] hover:bg-blue-50 font-bold shadow-md transition-all flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Voir le programme
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Leads & Équipe — accès rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to={ROUTES.PARTNER_SCANS}
          className="flex items-center gap-4 p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ScanLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Visiteurs Scannés</p>
            <p className="text-xs text-gray-500 mt-0.5">Consultez et exportez vos leads QR badge</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-indigo-500 transition-colors" />
        </Link>

        <Link
          to={ROUTES.PARTNER_TEAM}
          className="flex items-center gap-4 p-5 bg-white border border-amber-100 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Gérer l&apos;équipe</p>
            <p className="text-xs text-gray-500 mt-0.5">Ajoutez des collaborateurs à votre stand</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-amber-500 transition-colors" />
        </Link>
      </div>

    </div>
  );
}