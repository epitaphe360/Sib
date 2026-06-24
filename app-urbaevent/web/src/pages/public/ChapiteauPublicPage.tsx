import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tent, ArrowRight, CheckCircle, Calendar, Phone, Mail,
  Ruler, Maximize, Zap, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';

interface ChapiteauItem {
  id: string;
  name: string;
  description: string;
  size_label: string;
  surface_m2: number | null;
  price_per_day: number;
  currency: string;
  includes_installation: boolean;
  stock_available: number;
  image_url?: string;
}

const FEATURES = [
  { icon: '🔩', title: 'Structure aluminium', desc: 'Cadres professionnels résistants aux intempéries' },
  { icon: '🌧️', title: 'Bâches imperméables', desc: 'Protection UV et résistance pluie garantie' },
  { icon: '👷', title: 'Équipe dédiée', desc: 'Montage et démontage par nos techniciens' },
  { icon: '⚡', title: 'Installation rapide', desc: 'Mise en place en moins de 4h selon la taille' },
  { icon: '🔒', title: 'Structure normée', desc: 'Conforme aux normes de sécurité ERP' },
  { icon: '📞', title: 'Support 24/7', desc: 'Assistance technique sur site pendant le salon' },
];

const FAQ = [
  {
    q: "Le prix inclut-il l'installation et le démontage ?",
    a: "Oui, tous nos chapiteaux incluent l'installation complète avant l'ouverture du salon et le démontage après la clôture. Nos techniciens s'occupent de tout.",
  },
  {
    q: "Puis-je personnaliser mon chapiteau ?",
    a: "Absolument. Nous proposons des options de personnalisation : banderoles, éclairage intérieur, cloisons, revêtement de sol. Contactez notre équipe pour un devis personnalisé.",
  },
  {
    q: "Quelle est la capacité d'accueil selon la taille ?",
    a: "En règle générale : 3×3m (4-6 pers), 5×5m (10-15 pers), 10×10m (30-50 pers), 10×20m (60-100 pers), 20×40m (200-300 pers). Ces chiffres varient selon la configuration.",
  },
  {
    q: "Comment se passe la réservation ?",
    a: "Accédez au catalogue depuis votre espace exposant, sélectionnez les chapiteaux souhaités et procédez au paiement en ligne (PayPal ou CMI). Votre réservation est confirmée instantanément.",
  },
  {
    q: "Peut-on annuler ou modifier une réservation ?",
    a: "Les modifications sont acceptées jusqu'à 15 jours avant le salon. Pour toute annulation, contactez notre équipe à chapiteau@sib.ma. Des frais peuvent s'appliquer selon les conditions générales.",
  },
];

export default function ChapiteauPublicPage() {
  const [items, setItems]   = useState<ChapiteauItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    (supabase as any)
      .from('chapiteau_items')
      .select('*')
      .eq('is_active', true)
      .order('price_per_day')
      .then(({ data }: any) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-sib-paper">
      {/* Hero */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0B1C3D 0%, #1e3a5f 60%, #0B1C3D 100%)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%232E5984' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3Cpath stroke='%232E5984' stroke-width='0.6' d='M30 12L48 30L30 48L12 30Z'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%232E5984'/%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        {/* Shimmer */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(243,146,0,0.06) 50%, transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-[#F39200]/15 border border-[#F39200]/30 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-[#F39200]" />
              <span className="text-[#F39200] text-xs font-semibold tracking-wider uppercase">
                SIB 2026 — Module Location
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              Location de{' '}
              <span className="text-[#F39200]">Chapiteaux</span><br />
              Professionnels
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mb-8 leading-relaxed">
              Structures aluminium professionnelles pour votre espace au Salon International du Bâtiment.
              Du stand individuel 3×3m au chapiteau géant 20×40m — installation et dépose incluses.
            </p>
            <div className="flex flex-wrap gap-4 text-sm mb-10">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: '25 – 29 novembre 2026' },
                { icon: <CheckCircle className="w-4 h-4" />, label: 'Installation incluse' },
                { icon: <Users className="w-4 h-4" />, label: 'Réservé aux exposants' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 text-[#F39200]">
                  {f.icon} <span>{f.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={ROUTES.EXHIBITOR_CHAPITEAU}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-[#0B1C3D] transition hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
                <Tent className="w-4 h-4" /> Réserver — Exposant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to={ROUTES.PARTNER_CHAPITEAU}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition">
                <Tent className="w-4 h-4" /> Réserver — Exposant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B1C3D] text-center mb-10">
            Pourquoi choisir nos chapiteaux ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B1C3D] text-center mb-3">
            Notre Catalogue de Chapiteaux
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Toutes les tailles disponibles pour SIB 2026 — prix par jour, installation incluse
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="relative h-48"
                    style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Tent className="w-14 h-14 text-[#F39200]/50" />
                        <span className="text-[#F39200] font-bold text-xl">{item.size_label}</span>
                      </div>
                    )}
                    {item.includes_installation && (
                      <div className="absolute bottom-2 left-2 bg-[#F39200] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Installation incluse ✓
                      </div>
                    )}
                    {item.stock_available <= 3 && item.stock_available > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Plus que {item.stock_available} !
                      </div>
                    )}
                    {item.stock_available === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-white font-bold text-lg">Complet</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Ruler className="w-3 h-3" /> {item.size_label}
                      </span>
                      {item.surface_m2 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Maximize className="w-3 h-3" /> {item.surface_m2} m²
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-[#F39200]">
                          {item.price_per_day.toLocaleString('fr-MA')}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">MAD/jour</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#0B1C3D]">
                          {(item.price_per_day * 5).toLocaleString('fr-MA')} MAD
                        </div>
                        <div className="text-xs text-gray-400">5 jours salon</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <div className="inline-flex flex-col sm:flex-row gap-3 items-center">
              <Link to={ROUTES.EXHIBITOR_CHAPITEAU}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-[#0B1C3D] transition hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
                <Tent className="w-4 h-4" /> Réserver maintenant — Exposant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to={ROUTES.PARTNER_CHAPITEAU}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm border-2 border-[#0B1C3D] text-[#0B1C3D] hover:bg-[#0B1C3D] hover:text-white transition">
                <Tent className="w-4 h-4" /> Réserver — Exposant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B1C3D] text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-[#F39200] flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}>
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6"
        style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">⛺</div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Besoin d'un devis personnalisé ?
          </h2>
          <p className="text-[#F39200]/70 text-base mb-8 max-w-xl mx-auto">
            Pour les configurations sur mesure, les grandes surfaces ou les demandes spéciales,
            contactez directement notre équipe technique.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
            <a href="mailto:chapiteau@sib.ma"
              className="flex items-center gap-2 text-[#F39200] hover:text-white transition">
              <Mail className="w-4 h-4" /> chapiteau@sib.ma
            </a>
            <a href="tel:+212500000000"
              className="flex items-center gap-2 text-[#F39200] hover:text-white transition">
              <Phone className="w-4 h-4" /> +212 5 XX XX XX XX
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.EXHIBITOR_CHAPITEAU}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-[#0B1C3D] transition hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
              <Tent className="w-4 h-4" /> Catalogue Exposant <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={ROUTES.PARTNER_CHAPITEAU}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white border border-white/30 hover:bg-white/10 transition">
              <Tent className="w-4 h-4" /> Catalogue Exposant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
