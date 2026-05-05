import { Shield, FileText, Edit, LayoutDashboard, Users, Package, MailOpen, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface PartnerProfileTabProps {
  onOpenEditor: () => void;
}

export function PartnerProfileTab({ onOpenEditor }: PartnerProfileTabProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-10 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 h-full flex flex-col">
        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          {t('partner.manual_management')}
        </h3>
        <div className="space-y-4 flex-1">
          <Button
            onClick={onOpenEditor}
            variant="outline"
            className="w-full justify-between py-8 px-8 rounded-2xl border-2 hover:bg-slate-50 group font-bold"
          >
            <div className="flex items-center gap-4">
              <Edit className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
              {t('partner.edit_basic_info')}
            </div>
            <Shield className="h-5 w-5 text-slate-300" />
          </Button>
          <Link to={ROUTES.PARTNER_MEDIA_UPLOAD} className="block">
            <Button
              variant="outline"
              className="w-full justify-between py-8 px-8 rounded-2xl border-2 hover:bg-slate-50 group font-bold"
            >
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                {t('partner.media_catalog')}
              </div>
              <Shield className="h-5 w-5 text-slate-300" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* ── Nouveaux Services SIB 2026 ── */}
      <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-2 border-indigo-50">
        <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-indigo-500" />
          Services SIB 2026
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to={ROUTES.PARTNER_TEAM}>
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition cursor-pointer group">
              <div className="bg-indigo-100 p-2.5 rounded-xl group-hover:bg-indigo-200 transition">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Mon Équipe</div>
                <div className="text-xs text-slate-500">Gérer les collaborateurs</div>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.PARTNER_INVITATION_LETTER}>
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition cursor-pointer group">
              <div className="bg-indigo-100 p-2.5 rounded-xl group-hover:bg-indigo-200 transition">
                <MailOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Lettre d'Invitation</div>
                <div className="text-xs text-slate-500">Pour vos visiteurs étrangers</div>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.PARTNER_RENTAL}>
            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition cursor-pointer group">
              <div className="bg-emerald-100 p-2.5 rounded-xl group-hover:bg-emerald-200 transition">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Location Matériel</div>
                <div className="text-xs text-slate-500">Mobilier & équipements</div>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

