import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SiteBuilder } from '../../components/site-builder/SiteBuilder';
import { ROUTES } from '../../lib/routes';

export const EditMiniSitePage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();

  return (
    <div className="h-screen flex flex-col">
      <div className="px-4 py-2 bg-white border-b">
        <Link to={ROUTES.EXHIBITOR_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>
      </div>
      <div className="flex-1">
        <SiteBuilder siteId={siteId} />
      </div>
    </div>
  );
};
