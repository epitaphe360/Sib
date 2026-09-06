import { Link } from 'react-router-dom';
import { LAB_ROUTES } from '../routes';

export default function LabLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-700">Elitech Holding</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#0b1f3a]">Portail laboratoire</h1>
        <p className="mt-3 text-slate-600">Demandes, devis, analyses et rapports — espace sécurisé multi-laboratoires.</p>
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <Link to={LAB_ROUTES.REQUEST_FORM} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-400">
            <p className="font-medium">Nouvelle demande</p>
            <p className="text-sm text-slate-500 mt-1">Formulaire standardisé</p>
          </Link>
          <Link to={LAB_ROUTES.CLIENT_LOGIN} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-400">
            <p className="font-medium">Espace client</p>
            <p className="text-sm text-slate-500 mt-1">Connexion par code email</p>
          </Link>
          <Link to={LAB_ROUTES.LOGIN} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-400">
            <p className="font-medium">Laboratoire</p>
            <p className="text-sm text-slate-500 mt-1">Portail administrateur</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
