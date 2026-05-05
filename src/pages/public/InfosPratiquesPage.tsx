import { Link } from 'react-router-dom';
import { MapPin, Clock, Ticket, Bus, Train, Car, Plane, Hotel, Calendar, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../../components/ui/MoroccanDecor';

const defaultHoraires = [
  { jour: 'Mardi 25 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Mercredi 26 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Jeudi 27 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Vendredi 28 Novembre', heures: '9h00 – 19h00' },
  { jour: 'Samedi 29 Novembre', heures: '9h00 – 19h00' },
];

export default function InfosPratiquesPage() {
  const cms = usePageContent('infos-pratiques');

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const horaires = (() => {
    const raw = cms.horaires_json;
    if (!raw) {return defaultHoraires;}
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((h: any) => ({ jour: String(h?.jour ?? ''), heures: String(h?.heures ?? '') })).filter((h: any) => h.jour)
        : defaultHoraires;
    } catch {
      return defaultHoraires;
    }
  })();

  const tarifsBullets = (() => {
    const raw = cms.tarifs_bullets_json;
    if (!raw) {
      return [
        "D'un badge électronique téléchargeable sur le site ou à l'accueil du salon",
        "D'une invitation dûment remplie",
        "D'une carte de visite professionnelle",
      ];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [
        "D'un badge électronique téléchargeable sur le site ou à l'accueil du salon",
        "D'une invitation dûment remplie",
        "D'une carte de visite professionnelle",
      ];
    }
  })();

  const venirSections = (() => {
    const raw = cms.venir_json;
    if (!raw) {return null;}
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />
        <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              📍 SIB 2026 — El Jadida
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              {cms.hero_title || <>Infos <span style={{ color: '#52B847' }}>Pratiques</span></>}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {cms.hero_subtitle || "Tout ce qu'il faut savoir pour préparer votre visite au SIB 2026."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTIONS ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Lieu */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-[#00AEEF]" />
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-[#00AEEF] p-3 rounded-xl flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{getCms('lieu_title', "Parc d'Exposition Mohammed VI")}</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    {cms.lieu_adresse || "Route Nationale 1 vers Azemmour, Région Casablanca - Settat, 24000 — EL JADIDA"}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {getCms('lieu_context', "Implanté au cœur du Pôle urbain Mazagan (PUMA), le Parc d'Exposition Mohammed VI se voit efficacement desservi et stratégiquement connecté aux autres villes du royaume.")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Horaires */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-[#52B847]" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[#52B847] p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{getCms('horaires_title', 'Horaires')}</h2>
              </div>
              <div className="grid gap-2">
                {horaires.map((h) => (
                  <div key={h.jour} className="flex items-center justify-between bg-slate-50 rounded-xl px-5 py-3">
                    <span className="font-medium text-gray-700 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#52B847]" />{h.jour}
                    </span>
                    <span className="font-bold text-[#52B847] text-sm">{h.heures}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tarifs */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-[#E63329]" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#E63329] p-3 rounded-xl">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{getCms('tarifs_title', 'Tarifs')}</h2>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                {cms.tarifs_intro || "L'entrée est"} <strong>gratuite</strong>{!cms.tarifs_intro && " tout au long des 5 jours d'exposition. Toutefois, l'accès au salon sera conditionné par la présentation :"}
              </p>
              <ul className="space-y-2 mb-5">
                {tarifsBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63329] mt-2 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link to={ROUTES.BADGE}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                {getCms('tarifs_cta', 'Obtenir mon badge gratuit')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Comment venir */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-[#00AEEF]" />
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{getCms('venir_title', 'Comment venir ?')}</h2>
              <div className="space-y-6">
                {/* Navettes */}
                <div className="border-l-4 border-[#52B847] pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-5 h-5 text-[#52B847]" />
                    <h3 className="font-bold text-gray-900 text-sm">{venirSections?.[0]?.title ?? 'Par Navettes SIB'}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{venirSections?.[0]?.desc ?? "Des navettes seront mises gratuitement à disposition des visiteurs."}</p>
                  <p className="text-xs text-gray-400 italic">{venirSections?.[0]?.note ?? 'Les points de pick-up seront confirmés ultérieurement.'}</p>
                </div>
                {/* Voiture */}
                <div className="border-l-4 border-[#00AEEF] pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-[#00AEEF]" />
                    <h3 className="font-bold text-gray-900 text-sm">{venirSections?.[1]?.title ?? 'Par voiture'}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{venirSections?.[1]?.desc ?? "Accès rapide par l'autoroute Casablanca–El Jadida. Trajet depuis Casablanca : 50 minutes."}</p>
                  <p className="text-xs text-gray-400 italic">{venirSections?.[1]?.note ?? "Nous invitons nos visiteurs à privilégier le covoiturage."}</p>
                  <p className="text-xs text-gray-500 mt-1">Parking : <strong>2 500 places</strong> + parking VIP 52 places + autocars 50 places.</p>
                </div>
                {/* Train */}
                <div className="border-l-4 border-[#E63329] pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-5 h-5 text-[#E63329]" />
                    <h3 className="font-bold text-gray-900 text-sm">{venirSections?.[2]?.title ?? 'Par train'}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{venirSections?.[2]?.desc ?? "Accès depuis la gare d'Azemmour — Parc d'Expositions Mohammed VI (PEM6)."}</p>
                  <div className="bg-[#E63329]/5 rounded-lg p-3 text-xs text-gray-600">
                    {venirSections?.[2]?.note ?? "L'ONCF propose une réduction de 30% à bord de tous les trains durant la période du salon."}
                  </div>
                </div>
                {/* Avion */}
                <div className="border-l-4 border-[#00AEEF] pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-5 h-5 text-[#00AEEF]" />
                    <h3 className="font-bold text-gray-900 text-sm">{venirSections?.[3]?.title ?? 'Par avion'}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{venirSections?.[3]?.desc ?? "Le parc se situe à seulement 1h de route depuis l'aéroport Mohammed V."}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hébergement */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-[#52B847]" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#52B847] p-3 rounded-xl">
                  <Hotel className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{getCms('hebergement_title', 'Hébergement')}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Les exposants et visiteurs disposent d'une multitude de choix pour séjourner à proximité du parc.
                La ville d'El Jadida propose un choix varié d'hôtels dont les prix peuvent s'adapter à toutes les bourses.
              </p>
              <Link to={ROUTES.ACCOMMODATION}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#52B847] text-white rounded-xl font-semibold text-sm hover:bg-[#3D9B35] transition-colors">
                {getCms('hebergement_cta', 'Voir les hébergements')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold mb-3">Prêt à nous rejoindre ?</h3>
            <p className="text-white/75 mb-6 text-sm">Entrée gratuite — badge électronique obligatoire.</p>
            <Link to={ROUTES.BADGE}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#52B847] text-white rounded-xl font-bold text-sm hover:bg-[#3D9B35] transition-all shadow-lg hover:scale-105">
              Obtenir mon badge gratuit <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
