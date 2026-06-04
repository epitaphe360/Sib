import React from 'react';
import { Link } from 'react-router-dom';
import type { HomeMenuPanelProps } from '../types';

/** P3 — CONSTRUMAT Grid : cartes 3 colonnes */
export const HomeMenuVariant3: React.FC<HomeMenuPanelProps> = ({ items, onNavigate }) => (
  <div className="w-[min(640px,calc(100vw-2rem))] p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            to={item.href}
            onClick={onNavigate}
            className="flex flex-col p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3 group-hover:bg-primary-600 transition-colors">
              <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-white" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wide text-neutral-900 dark:text-white mb-1">
              {item.title}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
              {item.description}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);

export default HomeMenuVariant3;
