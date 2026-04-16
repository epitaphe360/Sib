import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Globe, Users, Building2, ArrowRight,
  CheckCircle, Clock, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Salon } from '../../contexts/SalonContext';
import { ROUTES } from '../../lib/routes';
import { Button } from '../../components/ui/Button';

export default function SalonPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {return;}
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setSalon(data as Salon);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2034] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]" />
      </div>
    );
  }

  if (notFound || !salon) {
    return (
      <div className="min-h-screen bg-[#0F2034] flex items-center justify-center text-white">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-[#C9A84C]" />
          <h1 className="text-2xl font-bold mb-2">Salon introuvable</h1>
          <p className="text-white/60 mb-6">Le salon « {slug} » n'existe pas ou n'est plus disponible.</p>
          <Link to={ROUTES.HOME}>
            <Button variant="primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  const dateDebut = formatDate(salon.date_debut);
  const dateFin = formatDate(salon.date_fin);
  const dateLabel = dateDebut && dateFin ? `${dateDebut} — ${dateFin}` : dateDebut || dateFin || 'Dates à confirmer';

  return (
    <div className="min-h-screen bg-[#0F2034]">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background: salon.cover_url
            ? `linear-gradient(rgba(15,32,52,0.72) 0%, rgba(15,32,52,0.90) 100%), url(${salon.cover_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0F2034 0%, #1B365D 50%, #0F2034 100%)',
        }}
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          {salon.logo_url && (
            <img
              src={salon.logo_url}
              alt={salon.name}
              className="h-20 mx-auto mb-6 object-contain drop-shadow-lg"
            />
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}>
            <CheckCircle className="h-3.5 w-3.5" />
            {salon.is_active ? 'Salon actif' : 'Édition passée'}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{salon.name}</h1>

          {salon.description && (
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">{salon.description}</p>
          )}

          <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm mb-8">
            {salon.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#C9A84C]" /> {salon.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#C9A84C]" /> {dateLabel}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={ROUTES.REGISTER_VISITOR}>
              <Button variant="primary" className="flex items-center gap-2">
                S'inscrire gratuitement <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.EXHIBITORS}>
              <Button variant="outline" className="text-white border-white/30 hover:border-[#C9A84C]">
                Voir les exposants
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── INFOS ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            Icon: Clock,
            label: 'Dates',
            value: dateLabel,
          },
          {
            Icon: MapPin,
            label: 'Lieu',
            value: salon.location || 'À confirmer',
          },
          {
            Icon: Globe,
            label: 'Site officiel',
            value: (salon.config as any)?.website || 'sibca.fr',
          },
        ].map(({ Icon, label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.12)' }}>
                <Icon className="h-5 w-5" style={{ color: '#C9A84C' }} />
              </div>
              <span className="text-sm font-semibold text-white/60">{label}</span>
            </div>
            <p className="text-white font-medium">{value}</p>
          </motion.div>
        ))}
      </section>

      {/* ── RUBRIQUES ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8">Explorer le salon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Exposants', desc: 'Découvrez les entreprises participantes', href: ROUTES.EXHIBITORS, Icon: Building2 },
            { label: 'Partenaires', desc: 'Nos partenaires institutionnels et privés', href: ROUTES.PARTNERS, Icon: Users },
            { label: 'Programme', desc: 'Conférences, ateliers et événements', href: ROUTES.EVENTS, Icon: Calendar },
          ].map(({ label, desc, href, Icon }) => (
            <Link key={label} to={href}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 0 24px rgba(201,168,76,0.18)' }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl p-5 cursor-pointer h-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Icon className="h-6 w-6 mb-3" style={{ color: '#C9A84C' }} />
                <h3 className="text-white font-semibold mb-1">{label}</h3>
                <p className="text-white/45 text-sm">{desc}</p>
                <ChevronRight className="h-4 w-4 text-white/30 mt-3" />
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
