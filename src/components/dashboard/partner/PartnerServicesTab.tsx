import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, Package, BadgeCheck, Mic2, Activity, TrendingUp, Image, UserCog, Star, HeadphonesIcon } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

const services = [
  {
    title: 'Mon Équipe Stand',
    description: 'Ajoutez vos collaborateurs — ils recevront un login et leur badge Sponsor.',
    icon: Users,
    link: ROUTES.PARTNER_TEAM,
    color: 'bg-blue-600',
    highlight: false,
  },
  {
    title: 'Mon Badge',
    description: 'Affichez, téléchargez et imprimez votre badge numérique SIB 2026.',
    icon: BadgeCheck,
    link: ROUTES.PARTNER_DASHBOARD,
    color: 'bg-indigo-600',
    highlight: true,
  },
  {
    title: 'Lettre d\'Invitation',
    description: 'Demandez une lettre officielle pour vos contacts et visiteurs étrangers.',
    icon: FileText,
    link: ROUTES.PARTNER_INVITATION_LETTER,
    color: 'bg-emerald-600',
    highlight: false,
  },
  {
    title: 'Location Matériel',
    description: 'Mobilier, audiovisuel, structure — commandez pour votre espace sponsor.',
    icon: Package,
    link: ROUTES.PARTNER_RENTAL,
    color: 'bg-amber-600',
    highlight: false,
  },
  {
    title: 'Espace Presse (Média)',
    description: 'Vous couvrez l\'événement ? Accédez aux ressources presse et accréditations.',
    icon: Mic2,
    link: ROUTES.MEDIA_PARTNER_DASHBOARD,
    color: 'bg-red-700',
    highlight: false,
  },
  {
    title: 'Mon Activité',
    description: 'Historique de vos interactions, vues de profil et échanges sur la plateforme.',
    icon: Activity,
    link: ROUTES.PARTNER_ACTIVITY,
    color: 'bg-cyan-600',
    highlight: false,
  },
  {
    title: 'Leads Générés',
    description: 'Consultez les contacts qualifiés et prospects générés lors du salon.',
    icon: TrendingUp,
    link: ROUTES.PARTNER_LEADS,
    color: 'bg-green-600',
    highlight: true,
  },
  {
    title: 'Ma Médiathèque',
    description: 'Gérez vos vidéos, podcasts et contenus diffusés sur la plateforme.',
    icon: Image,
    link: ROUTES.PARTNER_MEDIA,
    color: 'bg-purple-600',
    highlight: false,
  },
  {
    title: 'Éditer mon Profil',
    description: 'Mettez à jour les informations de votre organisation et vos coordonnées.',
    icon: UserCog,
    link: ROUTES.PARTNER_PROFILE_EDIT,
    color: 'bg-slate-600',
    highlight: false,
  },
  {
    title: 'Satisfaction & Feedback',
    description: 'Partagez votre expérience et consultez les évaluations reçues.',
    icon: Star,
    link: ROUTES.PARTNER_SATISFACTION,
    color: 'bg-yellow-600',
    highlight: false,
  },
  {
    title: 'Support & Assistance',
    description: 'Besoin d\'aide ? Contactez l\'équipe organisatrice directement.',
    icon: HeadphonesIcon,
    link: ROUTES.PARTNER_SUPPORT_PAGE,
    color: 'bg-rose-600',
    highlight: false,
  },
];

export function PartnerServicesTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Services SIB 2026</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tous les services disponibles pour votre participation en tant que sponsor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((svc, i) => (
          <motion.div
            key={svc.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={svc.link}
              className={`flex flex-col gap-4 p-5 rounded-2xl border-2 transition-all hover:shadow-lg group ${
                svc.highlight
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-400'
                  : 'bg-white border-gray-100 hover:border-[#C9A84C]/60'
              }`}
            >
              <div className={`${svc.color} p-3 rounded-xl w-fit`}>
                <svc.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#1B365D] transition-colors">
                  {svc.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{svc.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
