import { MapPin, Calendar, Clock, Smartphone } from 'lucide-react';

interface MobilePreviewProps {
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  location: string | null;
  date_debut: string | null;
  date_fin: string | null;
  is_active: boolean;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MobilePreview({
  name, logo_url, cover_url, description, location, date_debut, date_fin, is_active
}: MobilePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
        <Smartphone className="h-3.5 w-3.5" />
        <span>Aperçu mobile</span>
      </div>

      {/* Phone frame */}
      <div className="relative w-[280px] h-[560px] rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-20" />
        
        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-2 pb-1 text-[9px] text-white/80 font-medium">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-white/60 rounded-sm relative">
              <div className="absolute inset-0.5 bg-green-400 rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Header bar */}
          <div className="sticky top-0 z-10 flex items-center justify-center px-3 py-2 bg-white/95 backdrop-blur border-b border-gray-200/60">
            {logo_url ? (
              <img src={logo_url} alt="logo" className="h-7 w-auto object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-[#1B365D] tracking-wide">
                {name || 'SIB 2026'}
              </span>
            )}
          </div>

          {/* Hero section */}
          <div
            className="relative min-h-[200px] flex flex-col items-center justify-center px-4 py-8"
            style={{
              background: cover_url
                ? undefined
                : 'linear-gradient(135deg, #1B365D 0%, #0F2034 50%, #1B365D 100%)',
            }}
          >
            {cover_url && (
              <>
                <img
                  src={cover_url}
                  alt="cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(rgba(15,32,52,0.65) 0%, rgba(15,32,52,0.88) 100%)' }}
                />
              </>
            )}

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l10 10-10 10L0 10z' fill='%23fff' fill-opacity='.4'/%3E%3C/svg%3E")`,
              backgroundSize: '20px 20px',
            }} />

            <div className="relative z-10 text-center">
              {/* Logo */}
              {logo_url && (
                <img
                  src={logo_url}
                  alt="logo"
                  className="h-12 w-auto mx-auto mb-3 drop-shadow-lg"
                />
              )}

              {/* Status badge */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mb-2"
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.4)',
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-[8px] font-medium" style={{ color: '#C9A84C' }}>
                  {is_active ? 'Salon actif' : 'Inactif'}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-lg font-bold text-white leading-tight mb-1.5">
                {name || 'Nom du salon'}
              </h1>

              {/* Description */}
              {description && (
                <p className="text-[9px] text-white/60 leading-relaxed max-w-[220px] mx-auto mb-3 line-clamp-2">
                  {description}
                </p>
              )}

              {/* Location & Dates */}
              <div className="flex flex-col items-center gap-1">
                {location && (
                  <div className="flex items-center gap-1 text-white/70">
                    <MapPin className="h-2.5 w-2.5" />
                    <span className="text-[8px]">{location}</span>
                  </div>
                )}
                {(date_debut || date_fin) && (
                  <div className="flex items-center gap-1 text-white/70">
                    <Calendar className="h-2.5 w-2.5" />
                    <span className="text-[8px]">{fmtDate(date_debut)} — {fmtDate(date_fin)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="px-3 -mt-3 relative z-10">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Clock, label: 'Dates', value: date_debut ? fmtDate(date_debut) : '—' },
                { icon: MapPin, label: 'Lieu', value: location ? location.split(',')[0] : '—' },
                { icon: Calendar, label: 'Durée', value: date_debut && date_fin
                  ? `${Math.ceil((new Date(date_fin).getTime() - new Date(date_debut).getTime()) / 86400000)} jours`
                  : '—'
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg p-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Icon className="h-3 w-3 mx-auto mb-0.5" style={{ color: '#C9A84C' }} />
                  <p className="text-[7px] text-gray-400">{label}</p>
                  <p className="text-[8px] font-semibold text-gray-700 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sections preview */}
          <div className="px-3 py-3 space-y-2">
            {['Exposants', 'Programme', 'Partenaires'].map(section => (
              <div key={section} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#C9A84C' }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-700">{section}</span>
                </div>
                <span className="text-[9px] text-gray-400">→</span>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around">
            {['Accueil', 'Exposants', 'Programme', 'Profil'].map((tab, i) => (
              <div key={tab} className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-4 rounded-full ${i === 0 ? 'bg-[#1B365D]' : 'bg-gray-300'}`} />
                <span className={`text-[7px] ${i === 0 ? 'text-[#1B365D] font-semibold' : 'text-gray-400'}`}>
                  {tab}
                </span>
              </div>
            ))}
          </div>

          {/* Spacer for scrollable content */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
