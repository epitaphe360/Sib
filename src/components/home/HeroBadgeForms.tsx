import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Crown, Ticket } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { DM } from '../../design/designMasterTokens';
import { fetchVipPassPricing } from '../../services/visitorLevelService';
import { formatVisitorAmount } from '../../config/visitorBankTransferConfig';

const FREE_PERKS = [
  'home.badges.free_p1',
  'home.badges.free_p2',
  'home.badges.free_p3',
  'home.badges.free_p4',
] as const;

const VIP_PERKS = [
  'home.badges.vip_p1',
  'home.badges.vip_p2',
  'home.badges.vip_p3',
  'home.badges.vip_p4',
] as const;

interface HeroBadgeFormsProps {
  inTicketSection?: boolean;
}

/**
 * Billetterie premium — cartes Bento + liens vers les formulaires dédiés (plus d’embed lourd).
 */
export const HeroBadgeForms: React.FC<HeroBadgeFormsProps> = () => {
  const { t } = useTranslation();
  const [vipPrice, setVipPrice] = useState<string | null>(null);

  useEffect(() => {
    fetchVipPassPricing()
      .then((p) => setVipPrice(formatVisitorAmount(p.price, 'MAD')))
      .catch(() => setVipPrice(null));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
      {/* Pass Gratuit */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        transition={DM.springSoft}
        className="dm-glass-light rounded-[32px] p-8 lg:p-10 flex flex-col border border-white/20 shadow-[0_8px_32px_rgba(0,26,61,0.12)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center">
            <Ticket className="h-6 w-6 text-[#2D6A4F]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D6A4F]">
              {t('home.badges.free_kicker')}
            </p>
            <h3 className="text-xl lg:text-2xl font-black text-[#001A3D] tracking-tight">
              {t('home.badges.free_title')}
            </h3>
          </div>
        </div>
        <p className="text-sm text-[#001A3D]/70 leading-relaxed mb-8 flex-grow">
          {t('home.badges.free_desc')}
        </p>
        <ul className="space-y-3 mb-8">
          {FREE_PERKS.map((key) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-[#001A3D]/85">
              <CheckCircle className="h-4 w-4 text-[#2D6A4F] shrink-0 mt-0.5" strokeWidth={2.5} />
              {t(key)}
            </li>
          ))}
        </ul>
        <Link
          to={ROUTES.REGISTER_VISITOR}
          className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#2D6A4F] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#245a42] transition-colors"
        >
          {t('home.badges.free_cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Pass VIP */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...DM.springSoft, delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="relative rounded-[32px] p-8 lg:p-10 flex flex-col overflow-hidden border border-[#F39200]/30 shadow-[0_20px_60px_rgba(243,146,0,0.15)]"
        style={{ background: `linear-gradient(145deg, ${DM.navy} 0%, ${DM.navyDeep} 100%)` }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F39200]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="absolute top-6 right-6 text-[9px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-[#F39200] text-white">
          {t('home.badges.vip_badge')}
        </span>
        <div className="flex items-center gap-3 mb-6 relative">
          <div className="h-12 w-12 rounded-2xl bg-[#F39200]/20 flex items-center justify-center">
            <Crown className="h-6 w-6 text-[#F39200]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: DM.orange }}>
              {t('home.badges.vip_kicker')}
            </p>
            <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              {t('home.badges.vip_title')}
            </h3>
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed mb-4 relative">
          {t('home.badges.vip_desc')}
        </p>
        <p className="text-3xl font-black mb-8 relative" style={{ color: DM.orange }}>
          {vipPrice ?? t('home.badges.vip_price')}
          <span className="text-sm font-semibold text-white/50 ml-2">{t('home.badges.vip_price_note')}</span>
        </p>
        <ul className="space-y-3 mb-8 relative flex-grow">
          {VIP_PERKS.map((key) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-white/85">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: DM.orange }} strokeWidth={2.5} />
              {t(key)}
            </li>
          ))}
        </ul>
        <Link
          to={ROUTES.VISITOR_VIP_REGISTRATION}
          className="relative inline-flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#001A3D] transition-colors hover:opacity-95"
          style={{ backgroundColor: DM.orange }}
        >
          {t('home.badges.vip_cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
};

export default HeroBadgeForms;
