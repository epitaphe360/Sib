import React, { memo } from 'react';
import { Card } from '../ui/Card';
import LogoWithFallback from '../ui/LogoWithFallback';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

export interface ExhibitorDirectoryEntry {
  id: string;
  companyName: string;
  sector?: string;
  logo?: string;
  standNumber?: string;
  hallNumber?: string;
}

interface ExhibitorDirectoryCardProps {
  exhibitor: ExhibitorDirectoryEntry;
  index?: number;
}

function fieldValue(value: string | undefined, empty: string) {
  return value?.trim() ? value.trim() : empty;
}

/** Carte annuaire — N° Stand, N° Hall, Secteur d'activité uniquement */
const ExhibitorDirectoryCard: React.FC<ExhibitorDirectoryCardProps> = memo(({
  exhibitor,
  index = 0,
}) => {
  const { t } = useTranslation();
  const empty = t('exhibitors.directory.not_set');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className="p-5 h-full border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start gap-4">
          <LogoWithFallback
            src={exhibitor.logo}
            alt=""
            className="h-12 w-12 object-contain shrink-0 rounded-lg border border-neutral-200 p-1 opacity-90"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-900 dark:text-white truncate mb-3 text-[15px]">
              {exhibitor.companyName}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <dt className="text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
                  {t('exhibitors.directory.stand')}
                </dt>
                <dd className="text-neutral-900 dark:text-white font-semibold text-right tabular-nums">
                  {fieldValue(exhibitor.standNumber, empty)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <dt className="text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
                  {t('exhibitors.directory.hall')}
                </dt>
                <dd className="text-neutral-900 dark:text-white font-semibold text-right tabular-nums">
                  {fieldValue(exhibitor.hallNumber, empty)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
                  {t('exhibitors.directory.sector')}
                </dt>
                <dd className="text-primary-700 dark:text-primary-300 font-semibold text-right">
                  {fieldValue(exhibitor.sector, empty)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </motion.article>
  );
});

ExhibitorDirectoryCard.displayName = 'ExhibitorDirectoryCard';

export default ExhibitorDirectoryCard;
