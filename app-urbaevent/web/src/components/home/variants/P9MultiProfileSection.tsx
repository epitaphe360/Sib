import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { DM } from '../../../design/designMasterTokens';

type ProfileId = 'visitor' | 'exhibitor' | 'partner';

const PROFILE_META: Record<
  ProfileId,
  { icon: React.ReactNode; route: string; accent: string; accentBg: string }
> = {
  visitor: {
    icon: <Users className="h-7 w-7" strokeWidth={2} />,
    route: ROUTES.VISITOR_SUBSCRIPTION,
    accent: DM.navy,
    accentBg: `${DM.navy}12`,
  },
  exhibitor: {
    icon: <Building2 className="h-7 w-7" strokeWidth={2} />,
    route: ROUTES.EXHIBITOR_SUBSCRIPTION,
    accent: '#2D6A4F',
    accentBg: 'rgba(45,106,79,0.12)',
  },
  partner: {
    icon: <Briefcase className="h-7 w-7" strokeWidth={2} />,
    route: ROUTES.PARTNERSHIP,
    accent: DM.orange,
    accentBg: `${DM.orange}18`,
  },
};

const PROFILE_IDS: ProfileId[] = ['visitor', 'exhibitor', 'partner'];
const BENEFIT_KEYS = ['b1', 'b2', 'b3', 'b4'] as const;

/** P9 — Parcours multi-profils (visiteur · exposant · partenaire) */
export const P9MultiProfileSection: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ProfileId | null>(null);

  const profiles = useMemo(
    () =>
      PROFILE_IDS.map((id) => ({
        id,
        ...PROFILE_META[id],
        title: t(`home.p9_profiles.${id}_title`),
        description: t(`home.p9_profiles.${id}_desc`),
        benefits: BENEFIT_KEYS.map((b) => t(`home.p9_profiles.${id}_${b}`)),
        cta: t(`home.p9_profiles.${id}_cta`),
      })),
    [t],
  );

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ backgroundColor: '#ECECE8' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(ellipse at 70% 0%, ${DM.orange}18, transparent 55%)`,
        }}
      />
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: DM.orange }}
          >
            {t('home.p9_profiles.kicker')}
          </p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: DM.navy }}>
            {t('home.p9_profiles.title')}
          </h2>
          <p className="text-[#001A3D]/65 leading-relaxed">{t('home.p9_profiles.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {profiles.map((profile, index) => {
            const isActive = selected === profile.id;
            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...DM.springSoft, delay: index * 0.08 }}
                whileHover={{ scale: DM.hoverScale }}
                onClick={() => setSelected(isActive ? null : profile.id)}
                className={`relative rounded-[32px] p-8 lg:p-9 cursor-pointer flex flex-col transition-shadow ${
                  isActive
                    ? 'shadow-[0_16px_48px_rgba(0,26,61,0.14)]'
                    : 'border shadow-[0_8px_32px_rgba(0,26,61,0.08)] hover:shadow-[0_16px_48px_rgba(0,26,61,0.12)]'
                }`}
                style={{
                  backgroundColor: DM.glassBgLight,
                  borderColor: isActive ? profile.accent : DM.glassBorderLight,
                  borderWidth: isActive ? 2 : 1,
                  borderStyle: 'solid',
                }}
              >
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6"
                  style={{ backgroundColor: profile.accentBg, color: profile.accent }}
                >
                  {profile.icon}
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2" style={{ color: DM.navy }}>
                  {profile.title}
                </h3>
                <p className="text-sm text-[#001A3D]/65 leading-relaxed mb-6 flex-grow">
                  {profile.description}
                </p>

                <AnimatePresence>
                  {isActive && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2.5 mb-6 pt-5 border-t border-[#001A3D]/10 overflow-hidden"
                    >
                      {profile.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-sm text-[#001A3D]/80"
                        >
                          <CheckCircle
                            className="h-4 w-4 shrink-0 mt-0.5"
                            style={{ color: profile.accent }}
                            strokeWidth={2.5}
                          />
                          {benefit}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                <Link
                  to={profile.route}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: isActive ? profile.accent : DM.navy,
                    color: '#fff',
                  }}
                >
                  {profile.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="dm-glass-light rounded-[32px] p-8 lg:p-10 text-center border border-white/20"
        >
          <p className="text-[#001A3D]/65 mb-5">{t('home.p9_profiles.contact_desc')}</p>
          <Link
            to={ROUTES.CONTACT}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: DM.orange }}
          >
            {t('home.p9_profiles.contact_cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default P9MultiProfileSection;
