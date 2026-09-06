import { Link } from 'react-router-dom';
import { LAB_ROUTES } from '../routes';
import { LabJourneyGrid } from '../components/LabJourney';
import { LabBtn, LabPublicFrame } from '../components/LabUi';
import { LAB_THEME } from '../theme/tokens';

export default function LabLandingPage() {
  return (
    <LabPublicFrame>
      <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300">Automatisation complète du laboratoire</p>
          <h1 className="lab-display mt-3 text-5xl leading-[1.05] text-white sm:text-6xl">
            Portail laboratoire
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
            Le parcours de Madame Zineb, de A à Z. L’IA prépare et alerte.
            Aucune validation technique silencieuse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={LAB_ROUTES.REQUEST_FORM}><LabBtn tone="gold">Nouvelle demande</LabBtn></Link>
            <Link to={LAB_ROUTES.CLIENT_LOGIN}><LabBtn tone="cyan">Espace client</LabBtn></Link>
            <Link to={LAB_ROUTES.LOGIN}><LabBtn tone="ghost">Laboratoire</LabBtn></Link>
          </div>
        </div>
        <aside className="lab-glass rounded-3xl p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Workflow 12 étapes</p>
          <p className="lab-display mt-2 text-3xl text-white">De la demande à l’archive</p>
          <p className="mt-3 text-sm text-white/60">
            Dossier maître unique · marge configurable · OTP 10 min · Vercel uniquement.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Formulaire + e-mail', 'Étape 01'],
              ['Triple contrôle', 'Étape 07'],
              ['Portail OTP', 'Étape 09'],
              ['Marge suivie', 'Étape 11'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-300">{v}</p>
                <p className="mt-1 text-white">{k}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
      <p className="mb-4 mt-4 text-[11px] uppercase tracking-[0.28em]" style={{ color: LAB_THEME.goldSoft }}>
        Les 12 étapes officielles
      </p>
      <LabJourneyGrid />
      <footer className="mt-12 border-t border-white/10 pt-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Stack</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
          {['React', 'Supabase', 'Vercel', 'Resend', 'Google Backup'].map((s) => (
            <span key={s} className="rounded-full border border-white/15 px-3 py-1">{s}</span>
          ))}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
          Qualité · Traçabilité · Automatisation · Sécurité · Performance
        </p>
      </footer>
    </LabPublicFrame>
  );
}
