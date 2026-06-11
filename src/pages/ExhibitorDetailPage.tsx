import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../lib/routes';
import { useExhibitorStore } from '../store/exhibitorStore';
import ExhibitorDirectoryCard from '../components/exhibitor/ExhibitorDirectoryCard';

/** Fiche annuaire minimale — Stand, Hall, Secteur uniquement (sans présentation ni Vérifié) */
export default function ExhibitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { exhibitors, fetchExhibitors } = useExhibitorStore();

  useEffect(() => {
    if (!exhibitors.length) fetchExhibitors(true);
  }, [exhibitors.length, fetchExhibitors]);

  const exhibitor = exhibitors.find((e) => e.id === id);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="max-w-lg mx-auto px-4">
        <Link
          to={ROUTES.EXHIBITORS}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('pages.exhibitors.title')}
        </Link>

        {exhibitor ? (
          <ExhibitorDirectoryCard
            exhibitor={{
              id: exhibitor.id,
              companyName: exhibitor.companyName,
              sector: exhibitor.sector,
              logo: exhibitor.logo,
              standNumber: exhibitor.standNumber,
              hallNumber: exhibitor.hallNumber,
            }}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">{t('pages.exhibitors.no_results')}</p>
        )}
      </div>
    </div>
  );
}
