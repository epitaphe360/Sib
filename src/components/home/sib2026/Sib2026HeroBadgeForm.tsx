import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Crown, Ticket } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from './tokens';

/** Formulaire visiteur hero — badge gratuit + VIP (client SIB 2026) */
export const Sib2026HeroBadgeForm: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/30 text-center">
        <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: '#2D6A4F' }} />
        <p className="text-sm font-bold text-[#1B365D] mb-4">{t('home.badges.desc')}</p>
        <Link
          to={`${ROUTES.REGISTER_VISITOR}?email=${encodeURIComponent(email.trim())}`}
          className="sib2026-btn-orange inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px] w-full"
        >
          {t('networking.signup_button')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/30">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: SIB2026.orange }}>
        {t('networking.signup_button')}
      </p>
      <h2 className="sib2026-display text-lg font-black text-[#1B365D] mb-4 uppercase tracking-wide">
        {t('home.badges.title')}
      </h2>

      <form onSubmit={handleFreeSubmit} className="space-y-3 mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1B365D]/60">
          {t('home.badges.free_title')}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email')}
          className="w-full px-4 py-3 rounded-xl border border-[#1B365D]/15 text-sm text-[#1B365D] placeholder:text-[#1B365D]/40 focus:outline-none focus:ring-2 focus:ring-[#F39200]/50"
        />
        <button type="submit" className="sib2026-btn-orange w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px]">
          <Ticket className="h-4 w-4" />
          {t('networking.signup_button')}
        </button>
      </form>

      <div className="border-t border-[#1B365D]/10 pt-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1B365D]/60 mb-2">
          {t('home.badges.vip_title')}
        </label>
        <Link
          to={ROUTES.VISITOR_VIP_REGISTRATION}
          className="sib2026-btn-outline w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px] !text-[#1B365D] !border-[#1B365D]/25 bg-[#1B365D]/5 hover:bg-[#1B365D]/10"
        >
          <Crown className="h-4 w-4" style={{ color: SIB2026.orange }} />
          {t('home.badges.vip_cta')}
        </Link>
      </div>
    </div>
  );
};

export default Sib2026HeroBadgeForm;
