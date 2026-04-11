import { Crown, Calendar, MessageCircle, Award, Sparkles, Video, Headphones, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

export function VisitorVIPBenefits() {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Crown className="w-32 h-32 text-yellow-600" />
        </div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Crown className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('visitor.vip_benefits_title')}</h3>
            <p className="text-yellow-700 text-sm">{t('visitor.vip_benefits_subtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: Calendar, label: t('visitor.vip_appointments'), desc: t('visitor.vip_appointments_desc'), to: null },
            { icon: MessageCircle, label: t('visitor.vip_messaging'), desc: t('visitor.vip_messaging_desc'), to: ROUTES.CHAT },
            { icon: Award, label: t('visitor.vip_badge'), desc: t('visitor.vip_badge_desc'), to: ROUTES.BADGE },
            { icon: Sparkles, label: t('visitor.vip_ai_matching'), desc: t('visitor.vip_ai_matching_desc'), to: ROUTES.PROFILE_MATCHING },
            { icon: Video, label: t('visitor.vip_webinars'), desc: t('visitor.vip_webinars_desc'), to: ROUTES.WEBINARS },
            { icon: Headphones, label: t('visitor.vip_support_priority'), desc: t('visitor.vip_support_desc'), to: ROUTES.SUPPORT },
            { icon: Zap, label: t('visitor.vip_news_priority'), desc: t('visitor.vip_news_desc'), to: ROUTES.NEWS },
          ].map(({ icon: Icon, label, desc, to }) => {
            const cls = "flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-yellow-100 transition-all hover:bg-white hover:shadow-sm";
            const inner = (
              <>
                <Icon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              </>
            );
            return to ? (
              <Link key={label} to={to} className={cls}>{inner}</Link>
            ) : (
              <div key={label} className={cls}>{inner}</div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
