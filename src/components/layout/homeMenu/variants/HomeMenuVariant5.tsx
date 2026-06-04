import React from 'react';
import { Link } from 'react-router-dom';
import type { HomeMenuPanelProps } from '../types';

/** P5 — Minimal Line : ultra épuré, barre accent au survol */
export const HomeMenuVariant5: React.FC<HomeMenuPanelProps> = ({ items, onNavigate }) => (
  <div className="w-[280px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-1">
    {items.map((item, i) => (
      <Link
        key={item.key}
        to={item.href}
        onClick={onNavigate}
        className={`block px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border-l-[3px] border-transparent hover:border-primary-500 transition-colors ${
          i < items.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
        }`}
      >
        <span className="block text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
          {item.title}
        </span>
        <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          {item.description}
        </span>
      </Link>
    ))}
  </div>
);

export default HomeMenuVariant5;
