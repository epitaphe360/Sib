import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import LogoWithFallback from '../ui/LogoWithFallback';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import type { ExhibitorDirectoryEntry } from './ExhibitorDirectoryCard';

interface ExhibitorDirectoryTableProps {
  exhibitors: ExhibitorDirectoryEntry[];
}

function cell(value: string | undefined, empty: string) {
  return value?.trim() ? value.trim() : empty;
}

/** Vue liste — tableau annuaire exposants */
export const ExhibitorDirectoryTable: React.FC<ExhibitorDirectoryTableProps> = memo(({ exhibitors }) => {
  const { t } = useTranslation();
  const empty = t('exhibitors.directory.not_set');

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#001A3D] text-white text-[11px] uppercase tracking-[0.12em]">
          <tr>
            <th className="px-4 py-3 font-bold">{t('exhibitors.directory.company')}</th>
            <th className="px-4 py-3 font-bold whitespace-nowrap">{t('exhibitors.directory.stand')}</th>
            <th className="px-4 py-3 font-bold whitespace-nowrap">{t('exhibitors.directory.hall')}</th>
            <th className="px-4 py-3 font-bold">{t('exhibitors.directory.sector')}</th>
            <th className="px-4 py-3 font-bold whitespace-nowrap">{t('exhibitors.directory.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
          {exhibitors.map((ex) => (
            <tr key={ex.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">
                <div className="flex items-center gap-3 min-w-[180px]">
                  <LogoWithFallback
                    src={ex.logo}
                    alt=""
                    className="h-8 w-8 object-contain rounded border border-neutral-200 p-0.5 shrink-0"
                  />
                  <span>{ex.companyName}</span>
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums text-neutral-800 dark:text-neutral-200">
                {cell(ex.standNumber, empty)}
              </td>
              <td className="px-4 py-3 tabular-nums text-neutral-800 dark:text-neutral-200">
                {cell(ex.hallNumber, empty)}
              </td>
              <td className="px-4 py-3 text-primary-700 dark:text-primary-300 font-medium">
                {cell(ex.sector, empty)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  to={ROUTES.MINISITE_PREVIEW.replace(':exhibitorId', ex.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sib-orange px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white hover:brightness-110 transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t('exhibitors.directory.view_minisite')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ExhibitorDirectoryTable.displayName = 'ExhibitorDirectoryTable';

export default ExhibitorDirectoryTable;
