import { Sparkles, Shield, FileText, Edit, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface PartnerProfileTabProps {
  onOpenScrapper: () => void;
  onOpenEditor: () => void;
}

export function PartnerProfileTab({ onOpenScrapper, onOpenEditor }: PartnerProfileTabProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-10 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 h-full flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center mb-6">
          <Sparkles className="h-12 w-12 text-indigo-600" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4">{t('partner.ai_generation')}</h3>
        <p className="text-slate-600 mb-8 max-w-sm">{t('partner.ai_description')}</p>
        <Button
          onClick={onOpenScrapper}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-8 rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
        >
          <Sparkles className="h-5 w-5 mr-3" />
          {t('partner.ai_button')}
        </Button>
      </Card>

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
