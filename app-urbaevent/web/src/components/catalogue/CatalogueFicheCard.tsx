import React from 'react';

export interface CatalogueEntry {
  id: string;
  token: string;
  status: 'not_sent' | 'invited' | 'in_progress' | 'completed' | 'validated';
  completion_percent: number;
  contact_email: string;
  invited_at?: string;
  last_reminder_at?: string;
  reminder_count: number;
  completed_at?: string;
  validated_at?: string;
  company_name?: string;
  logo_url?: string;
  country_flag?: string;
  stand_number?: string;
  hall?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  website?: string;
  contact_name?: string;
  contact_title?: string;
  activity_description?: string;
  brands_represented?: string;
  products_origin_country?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  // Champs étendus SIB 2026
  sector?: string;
  fax?: string;
  gsm?: string;
  zip_code?: string;
  contact_direct_phone?: string;
  contact_direct_email?: string;
  youtube_url?: string;
  products_services?: string;
}

interface CatalogueFicheCardProps {
  entry: CatalogueEntry;
  /** Affichage en mode impression (sans ombre, sans bords arrondis) */
  printMode?: boolean;
}

const FLAG_URL = (code: string) =>
  `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

export const CatalogueFicheCard: React.FC<CatalogueFicheCardProps> = ({
  entry,
  printMode = false,
}) => {
  const containerClass = printMode
    ? 'w-full border border-gray-300 bg-white overflow-hidden'
    : 'w-full border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden';

  return (
    <div className={containerClass} style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt' }}>
      {/* ─── EN-TÊTE ─────────────────────────────────────────── */}
      <div
        className="flex items-start gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        {/* Logo */}
        <div
          className="flex-shrink-0 flex items-center justify-center bg-gray-50 border border-gray-200"
          style={{ width: 80, height: 60, overflow: 'hidden' }}
        >
          {entry.logo_url ? (
            <img
              src={entry.logo_url}
              alt={entry.company_name}
              style={{ maxWidth: 76, maxHeight: 56, objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>LOGO</span>
          )}
        </div>

        {/* Nom + Stand */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontWeight: 700,
              fontSize: '11pt',
              color: '#1e293b',
              lineHeight: 1.2,
              marginBottom: 2,
            }}
          >
            {entry.company_name || '—'}
          </div>
          {(entry.stand_number || entry.hall) && (
            <div style={{ fontWeight: 600, fontSize: '10pt', color: '#F39200' }}>
              {entry.stand_number && `Stand n° ${entry.stand_number}`}
              {entry.hall && ` Hall ${entry.hall}`}
            </div>
          )}
        </div>

        {/* Drapeau pays */}
        {entry.country_flag && (
          <div className="flex-shrink-0">
            <img
              src={FLAG_URL(entry.country_flag)}
              alt={entry.country_flag}
              style={{ width: 24, height: 18, border: '1px solid #e5e7eb' }}
            />
          </div>
        )}
      </div>

      {/* ─── CORPS ──────────────────────────────────────────────── */}
      <div className="flex" style={{ minHeight: 110 }}>
        {/* Colonne gauche — Coordonnées */}
        <div
          className="flex-none px-4 py-3 text-xs text-gray-700"
          style={{
            width: '42%',
            borderRight: '1px solid #e5e7eb',
            lineHeight: 1.5,
          }}
        >
          {(entry.address || entry.city) && (
            <div style={{ marginBottom: 6 }}>
              {entry.address && <div>{entry.address}</div>}
              {entry.city && (
                <div>
                  {entry.city}
                  {entry.country && `, ${entry.country}`}
                </div>
              )}
            </div>
          )}
          {entry.phone && (
            <div style={{ marginBottom: 2 }}>
              <strong>Tél :</strong> {entry.phone}
            </div>
          )}
          {entry.phone2 && (
            <div style={{ marginBottom: 2 }}>{entry.phone2}</div>
          )}
          {entry.email && (
            <div style={{ marginBottom: 2 }}>
              <strong>E-mail :</strong>{' '}
              <span style={{ color: '#F39200' }}>{entry.email}</span>
            </div>
          )}
          {entry.website && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#F39200' }}>{entry.website}</span>
            </div>
          )}
          {/* Réseaux sociaux */}
          <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: '#475569' }}>
            {entry.facebook_url && (
              <span>📘 {entry.facebook_url.replace(/https?:\/\/(www\.)?facebook\.com\//i, '')}</span>
            )}
            {entry.instagram_url && (
              <span>📷 {entry.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//i, '')}</span>
            )}
          </div>
        </div>

        {/* Colonne droite — Description */}
        <div
          className="flex-1 px-4 py-3 text-xs text-gray-700"
          style={{ lineHeight: 1.5 }}
        >
          {entry.contact_name && (
            <div style={{ marginBottom: 6 }}>
              <strong>{entry.contact_title || 'Responsable'} :</strong>{' '}
              {entry.contact_name}
            </div>
          )}
          {entry.activity_description && (
            <div style={{ marginBottom: 6 }}>
              <strong>Activité détaillée :</strong>{' '}
              <span>{entry.activity_description}</span>
            </div>
          )}
          {entry.brands_represented && (
            <div style={{ marginBottom: 4 }}>
              <strong>Marque représentée :</strong>{' '}
              {entry.brands_represented}
            </div>
          )}
          {entry.products_origin_country && (
            <div>
              <strong>Pays d'origine des produits :</strong>{' '}
              {entry.products_origin_country}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueFicheCard;
