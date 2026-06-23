import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Store } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

export const WorldMobileStickyBar: React.FC = () => (
  <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[#001A3D]/10 bg-white">
    <div className="flex max-w-lg mx-auto">
      <Link
        to={ROUTES.REGISTER_VISITOR}
        className="sib2026-btn-orange flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[10px]"
      >
        <Ticket className="h-4 w-4" />
        Badge visiteur
      </Link>
      <Link
        to={ROUTES.EXHIBITOR_SUBSCRIPTION}
        className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
        style={{ backgroundColor: '#001A3D' }}
      >
        <Store className="h-4 w-4" />
        Exposer
      </Link>
    </div>
  </div>
);
