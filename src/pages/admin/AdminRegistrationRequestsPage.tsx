import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RegistrationRequests from '../../components/admin/RegistrationRequests';
import { ROUTES } from '../../lib/routes';

export default function AdminRegistrationRequestsPage() {
  return (
    <div className="min-h-screen bg-sib-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="inline-flex items-center gap-2 text-sm text-sib-gray-500 hover:text-[#1B365D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </div>
        <RegistrationRequests />
      </div>
    </div>
  );
}
