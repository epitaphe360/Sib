import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';
import { useSalonPartnersCms } from '../../hooks/useSalonPartnersCms';
import type { SalonPartnerCmsGroup } from '../../config/mobileAppDefaultContent';
import { HoverCard, StaggerItem, StaggerReveal } from '../ui/motion';

type Props = {
  salonKey?: string;
  /** presentation = cartes page Présentation ; home = style accueil institutionnel */
  variant?: 'presentation' | 'home';
  title?: string;
  className?: string;
};

function groupAccent(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('organisateur délégué') || l.includes('délégué')) return 'Organisateur délégué';
  if (l.includes('co-organ')) return 'Co-organisateur';
  if (l.includes('sponsor')) return 'Sponsor';
  if (l.includes('organisateur')) return 'Organisateur';
  return label;
}

function PartnerLogo({ name, acronym, logoUrl }: { name: string; acronym: string; logoUrl?: string }) {
  if (logoUrl?.trim()) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-12 w-auto max-w-[140px] object-contain mx-auto mb-4"
        loading="lazy"
      />
    );
  }
  return (
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sib-navy text-white font-bold text-xs">
      {acronym || name.slice(0, 2)}
    </div>
  );
}

function PartnersGrid({ groups, variant }: { groups: SalonPartnerCmsGroup[]; variant: 'presentation' | 'home' }) {
  const items = groups.flatMap((group) =>
    group.partners
      .filter((p) => p.name.trim())
      .map((partner) => ({
        ...partner,
        role: groupAccent(group.label),
        groupLabel: group.label,
      })),
  );

  if (items.length === 0) return null;

  if (variant === 'presentation') {
    return (
      <StaggerReveal className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((org) => (
          <StaggerItem key={`${org.groupLabel}-${org.name}`}>
            <HoverCard className="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-sib-orange" />
              <PartnerLogo name={org.name} acronym={org.acronym} logoUrl={org.logoUrl} />
              <span className="inline-block px-3 py-1 rounded-full bg-sib-orange/10 text-sib-navy text-xs font-semibold mb-3 border border-sib-orange/20">
                {org.role}
              </span>
              <h4 className="font-bold text-gray-900 mb-2 tracking-tight text-sm leading-snug">{org.name}</h4>
              {org.acronym && org.acronym !== org.name.slice(0, 2) ? (
                <p className="text-xs text-gray-500">{org.acronym}</p>
              ) : null}
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerReveal>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((org, i) => (
        <motion.div
          key={`${org.groupLabel}-${org.name}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          className="rounded-xl p-5 flex items-start gap-4 border bg-white/90 backdrop-blur shadow-sm border-indigo-600/15"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs bg-white border border-indigo-600/15 text-indigo-600 overflow-hidden">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="h-full w-full object-contain p-1" loading="lazy" />
            ) : (
              org.acronym || org.name.slice(0, 3)
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-indigo-600">{org.role}</span>
            <h4 className="font-semibold text-sm text-gray-900 leading-snug mt-0.5">{org.name}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function SalonPartnersWebSection({
  salonKey = 'sib',
  variant = 'presentation',
  title = 'Organisateurs & Sponsors',
  className = '',
}: Props) {
  const { partners, bannerUrl, displayMode, loading } = useSalonPartnersCms(salonKey);
  const groups = partners.groups ?? [];

  const showBanner =
    displayMode !== 'list' && Boolean(bannerUrl) && groups.every((g) => g.partners.every((p) => !p.logoUrl?.trim()));

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (showBanner && bannerUrl) {
    return (
      <section className={className}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-amber-100 rounded-full mb-4">
            <Handshake className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-display">{title}</h2>
        </div>
        <img
          src={bannerUrl}
          alt="Partenaires et sponsors SIB 2026"
          className="w-full max-w-5xl mx-auto rounded-2xl shadow-md object-contain"
          loading="lazy"
        />
      </section>
    );
  }

  if (variant === 'home') {
    return (
      <section className={`relative py-16 lg:py-20 bg-gradient-to-b from-sib-light/40 via-white to-white border-t border-b border-slate-200/60 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3 text-yellow-400">Sponsors & Organisateurs</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">{title}</h2>
          </motion.div>
          <PartnersGrid groups={groups} variant="home" />
        </div>
      </section>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-3xl font-bold text-sib-navy mb-10 text-center font-display">{title}</h2>
      <PartnersGrid groups={groups} variant="presentation" />
    </div>
  );
}
