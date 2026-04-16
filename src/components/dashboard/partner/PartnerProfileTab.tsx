import { Shield, FileText, Edit, LayoutDashboard } from 'lucide-react';
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
    <div className="max-w-xl">
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
    </div>
  );
}
