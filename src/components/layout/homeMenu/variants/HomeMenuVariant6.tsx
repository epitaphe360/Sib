import React from 'react';
import { Link } from 'react-router-dom';
import type { HomeMenuPanelProps } from '../types';

/** P6 — Glass Light : verre dépoli, pastilles primary-100 */
export const HomeMenuVariant6: React.FC<HomeMenuPanelProps> = ({ items, onNavigate }) => (
  <div className="w-[320px] rounded-2xl border border-primary-100/80 dark:border-primary-800/50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl p-3">
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            to={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
          >
            <span className="h-9 w-9 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition-colors">
              <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </span>
            <div className="min-w-0">
              <div className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight">
                {item.title}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
);

export default HomeMenuVariant6;
