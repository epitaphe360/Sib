import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ZoomIn, ZoomOut, MapPin, X, Info,
  ArrowRight, Building2, Users, LayoutGrid
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/routes';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booth {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  sector: string;
  surface: string;
  x: number; y: number; width: number; height: number;
  hall: string;
  color: string;
  occupied: boolean;
  certifications?: string[];
}

interface Hall {
  id: string; name: string; theme: string;
  x: number; y: number; width: number; height: number;
  color: string; bgColor: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const SECTORS = [
  { id: 'all', label: 'Tous', color: '#6B7280' },
  { id: 'gros_oeuvre', label: 'Gros Oeuvre', color: '#1D4ED8' },
  { id: 'second_oeuvre', label: 'Second Oeuvre', color: '#059669' },
  { id: 'mep_cvc', label: 'MEP / CVC', color: '#D97706' },
  { id: 'finitions', label: 'Finitions', color: '#7C3AED' },
  { id: 'innovation', label: 'Innovation', color: '#DC2626' },
  { id: 'materiaux', label: 'Matériaux', color: '#0891B2' },
];

const HALLS: Hall[] = [
  { id: 'A', name: 'Hall A', theme: 'Gros Oeuvre & Structure', x: 20, y: 20, width: 380, height: 280, color: '#1D4ED8', bgColor: '#EFF6FF' },
  { id: 'B', name: 'Hall B', theme: 'Second Oeuvre & Finitions', x: 420, y: 20, width: 360, height: 280, color: '#059669', bgColor: '#F0FDF4' },
  { id: 'C', name: 'Hall C', theme: 'MEP / CVC / Électricité', x: 20, y: 320, width: 380, height: 280, color: '#D97706', bgColor: '#FFFBEB' },
  { id: 'D', name: 'Hall D', theme: 'Innovation & Numérique', x: 420, y: 320, width: 360, height: 280, color: '#7C3AED', bgColor: '#FAF5FF' },
];

const STATIC_BOOTHS: Booth[] = [
  // Hall A — Gros Oeuvre
  { id: 'A01', exhibitorId: '1', exhibitorName: 'Ciment du Maroc', sector: 'gros_oeuvre', surface: '36m²', x: 40, y: 60, width: 62, height: 52, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['QUALIBAT', 'ISO 9001'] },
  { id: 'A02', exhibitorId: '2', exhibitorName: 'Lafarge Holcim MA', sector: 'gros_oeuvre', surface: '54m²+', x: 112, y: 60, width: 80, height: 52, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['ISO 9001', 'ISO 14001'] },
  { id: 'A03', exhibitorId: '3', exhibitorName: 'Société des Bétons', sector: 'gros_oeuvre', surface: '18m²', x: 202, y: 60, width: 52, height: 42, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['CE'] },
  { id: 'A04', exhibitorId: '4', exhibitorName: 'Acier Maroc', sector: 'gros_oeuvre', surface: '36m²', x: 264, y: 60, width: 62, height: 52, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['ISO 9001'] },
  { id: 'A05', exhibitorId: '5', exhibitorName: 'FER-BTP', sector: 'gros_oeuvre', surface: '9m²', x: 336, y: 60, width: 42, height: 42, hall: 'A', color: '#3B82F6', occupied: true, certifications: [] },
  { id: 'A06', exhibitorId: '6', exhibitorName: 'Coffrages Pro', sector: 'gros_oeuvre', surface: '18m²', x: 40, y: 132, width: 52, height: 42, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'A07', exhibitorId: '7', exhibitorName: 'Fondations SA', sector: 'gros_oeuvre', surface: '36m²', x: 102, y: 132, width: 62, height: 52, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'A08', exhibitorId: '8', exhibitorName: 'Granulats Atlas', sector: 'materiaux', surface: '18m²', x: 174, y: 132, width: 52, height: 42, hall: 'A', color: '#0891B2', occupied: true, certifications: ['CE'] },
  { id: 'A09', exhibitorId: '9', exhibitorName: 'Mortiers BTP', sector: 'gros_oeuvre', surface: '9m²', x: 236, y: 132, width: 42, height: 42, hall: 'A', color: '#3B82F6', occupied: true, certifications: [] },
  { id: 'A10', exhibitorId: '10', exhibitorName: 'Carrefour Étanchéité', sector: 'second_oeuvre', surface: '9m²', x: 288, y: 132, width: 42, height: 42, hall: 'A', color: '#059669', occupied: false, certifications: [] },
  { id: 'A11', exhibitorId: '11', exhibitorName: 'Techniques Charpente', sector: 'gros_oeuvre', surface: '18m²', x: 40, y: 204, width: 58, height: 48, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'A12', exhibitorId: '12', exhibitorName: 'Préfabriqués MA', sector: 'gros_oeuvre', surface: '36m²', x: 108, y: 204, width: 62, height: 52, hall: 'A', color: '#1D4ED8', occupied: true, certifications: ['ISO 9001'] },
  { id: 'A13', exhibitorId: '33', exhibitorName: 'Béton Armé Pro', sector: 'gros_oeuvre', surface: '18m²', x: 180, y: 204, width: 52, height: 42, hall: 'A', color: '#1D4ED8', occupied: false, certifications: [] },
  // Hall B — Second Oeuvre & Finitions
  { id: 'B01', exhibitorId: '13', exhibitorName: 'Menuiserie Atlas', sector: 'second_oeuvre', surface: '18m²', x: 440, y: 60, width: 58, height: 48, hall: 'B', color: '#059669', occupied: true, certifications: ['OPQCB'] },
  { id: 'B02', exhibitorId: '14', exhibitorName: 'Plâtrerie du Nord', sector: 'second_oeuvre', surface: '36m²', x: 508, y: 60, width: 62, height: 52, hall: 'B', color: '#059669', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'B03', exhibitorId: '15', exhibitorName: 'Carrelage Prestige', sector: 'finitions', surface: '54m²+', x: 580, y: 60, width: 80, height: 56, hall: 'B', color: '#7C3AED', occupied: true, certifications: ['CE', 'ISO 9001'] },
  { id: 'B04', exhibitorId: '16', exhibitorName: 'Peintures Couleurs', sector: 'finitions', surface: '9m²', x: 670, y: 60, width: 42, height: 42, hall: 'B', color: '#7C3AED', occupied: true, certifications: [] },
  { id: 'B05', exhibitorId: '17', exhibitorName: 'Isolation Pro', sector: 'second_oeuvre', surface: '18m²', x: 440, y: 132, width: 58, height: 48, hall: 'B', color: '#059669', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'B06', exhibitorId: '18', exhibitorName: 'Cloisons & Plafonds', sector: 'second_oeuvre', surface: '36m²', x: 508, y: 132, width: 62, height: 52, hall: 'B', color: '#059669', occupied: true, certifications: ['ISO 9001'] },
  { id: 'B07', exhibitorId: '19', exhibitorName: 'Étanchéité Total', sector: 'second_oeuvre', surface: '18m²', x: 580, y: 132, width: 58, height: 48, hall: 'B', color: '#059669', occupied: false, certifications: [] },
  { id: 'B08', exhibitorId: '20', exhibitorName: 'Façades & Bardage', sector: 'second_oeuvre', surface: '36m²', x: 440, y: 204, width: 68, height: 52, hall: 'B', color: '#059669', occupied: true, certifications: ['QUALIBAT', 'CE'] },
  { id: 'B09', exhibitorId: '34', exhibitorName: 'Parquet & Sols', sector: 'finitions', surface: '18m²', x: 518, y: 204, width: 55, height: 48, hall: 'B', color: '#7C3AED', occupied: true, certifications: ['CE'] },
  // Hall C — MEP / CVC / Électricité
  { id: 'C01', exhibitorId: '21', exhibitorName: 'Plomberie Expert', sector: 'mep_cvc', surface: '18m²', x: 40, y: 360, width: 58, height: 48, hall: 'C', color: '#D97706', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'C02', exhibitorId: '22', exhibitorName: 'Climatisation Atlas', sector: 'mep_cvc', surface: '54m²+', x: 108, y: 360, width: 78, height: 58, hall: 'C', color: '#D97706', occupied: true, certifications: ['ISO 9001', 'ONEE'] },
  { id: 'C03', exhibitorId: '23', exhibitorName: 'Électricité BTP', sector: 'mep_cvc', surface: '36m²', x: 196, y: 360, width: 62, height: 52, hall: 'C', color: '#D97706', occupied: true, certifications: ['ONEE'] },
  { id: 'C04', exhibitorId: '24', exhibitorName: 'Chauffage & CVC', sector: 'mep_cvc', surface: '18m²', x: 268, y: 360, width: 58, height: 48, hall: 'C', color: '#D97706', occupied: true, certifications: ['QUALIBAT'] },
  { id: 'C05', exhibitorId: '25', exhibitorName: 'Ventilation Pro', sector: 'mep_cvc', surface: '9m²', x: 336, y: 360, width: 42, height: 42, hall: 'C', color: '#F59E0B', occupied: true, certifications: [] },
  { id: 'C06', exhibitorId: '26', exhibitorName: 'Énergie Solaire MA', sector: 'mep_cvc', surface: '36m²', x: 40, y: 432, width: 68, height: 52, hall: 'C', color: '#D97706', occupied: false, certifications: ['ISO 9001'] },
  { id: 'C07', exhibitorId: '27', exhibitorName: 'Smart Building Tech', sector: 'innovation', surface: '18m²', x: 118, y: 432, width: 58, height: 48, hall: 'C', color: '#DC2626', occupied: true, certifications: ['CE'] },
  { id: 'C08', exhibitorId: '35', exhibitorName: 'Sécurité Incendie', sector: 'mep_cvc', surface: '18m²', x: 186, y: 432, width: 58, height: 48, hall: 'C', color: '#D97706', occupied: true, certifications: ['QUALIBAT'] },
  // Hall D — Innovation & Numérique
  { id: 'D01', exhibitorId: '28', exhibitorName: 'BIM Solutions MA', sector: 'innovation', surface: '36m²', x: 440, y: 360, width: 68, height: 52, hall: 'D', color: '#DC2626', occupied: true, certifications: ['ISO 9001'] },
  { id: 'D02', exhibitorId: '29', exhibitorName: 'Drone BTP', sector: 'innovation', surface: '18m²', x: 518, y: 360, width: 58, height: 48, hall: 'D', color: '#DC2626', occupied: true, certifications: [] },
  { id: 'D03', exhibitorId: '30', exhibitorName: 'IA Construction', sector: 'innovation', surface: '54m²+', x: 586, y: 360, width: 78, height: 62, hall: 'D', color: '#DC2626', occupied: true, certifications: ['ISO 9001'] },
  { id: 'D04', exhibitorId: '31', exhibitorName: 'Réalité Augmentée BTP', sector: 'innovation', surface: '18m²', x: 440, y: 432, width: 58, height: 48, hall: 'D', color: '#DC2626', occupied: true, certifications: [] },
  { id: 'D05', exhibitorId: '32', exhibitorName: 'Logiciels Archi', sector: 'innovation', surface: '36m²', x: 508, y: 432, width: 62, height: 52, hall: 'D', color: '#DC2626', occupied: false, certifications: [] },
  { id: 'D06', exhibitorId: '36', exhibitorName: 'IoT Bâtiment', sector: 'innovation', surface: '9m²', x: 580, y: 432, width: 42, height: 42, hall: 'D', color: '#EF4444', occupied: true, certifications: ['CE'] },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HallMapPage() {
  const [booths, setBooths] = useState<Booth[]>(STATIC_BOOTHS);
  const [isLoadingBooths, setIsLoadingBooths] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [activeSector, setActiveSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadBoothsFromDb = async () => {
      try {
        const { data, error } = await supabase
          .from('exhibitors')
          .select('id, company_name, sector, stand_number, verified, featured')
          .order('company_name', { ascending: true });

        if (error || !data || data.length === 0) {
          setBooths(STATIC_BOOTHS);
          return;
        }

        const staticById = STATIC_BOOTHS.reduce((acc: Record<string, Booth>, b) => {
          acc[b.id] = b;
          return acc;
        }, {});

        const staticByExhibitorId = STATIC_BOOTHS.reduce((acc: Record<string, Booth>, b) => {
          acc[b.exhibitorId] = b;
          return acc;
        }, {});

        const mapped = data.slice(0, STATIC_BOOTHS.length).map((exhibitor: any, idx: number) => {
          const stand = exhibitor.stand_number ? String(exhibitor.stand_number).toUpperCase() : '';
          const base = staticById[stand] || staticByExhibitorId[String(exhibitor.id)] || STATIC_BOOTHS[idx];
          const normalizedSector = String(exhibitor.sector || base.sector || 'materiaux').toLowerCase();
          const sector = normalizedSector.includes('gros') ? 'gros_oeuvre'
            : normalizedSector.includes('second') ? 'second_oeuvre'
            : normalizedSector.includes('mep') || normalizedSector.includes('cvc') || normalizedSector.includes('electric') ? 'mep_cvc'
            : normalizedSector.includes('finition') ? 'finitions'
            : normalizedSector.includes('innov') || normalizedSector.includes('bim') ? 'innovation'
            : normalizedSector.includes('mater') ? 'materiaux'
            : base.sector;

          return {
            ...base,
            id: stand || base.id,
            exhibitorId: String(exhibitor.id || base.exhibitorId),
            exhibitorName: exhibitor.company_name || base.exhibitorName,
            sector,
            occupied: true,
          } as Booth;
        });

        setBooths(mapped.length > 0 ? mapped : STATIC_BOOTHS);
      } catch {
        setBooths(STATIC_BOOTHS);
      } finally {
        setIsLoadingBooths(false);
      }
    };

    loadBoothsFromDb();
  }, []);

  const filteredBooths = booths.filter(b => {
    const matchesSector = activeSector === 'all' || b.sector === activeSector;
    const matchesSearch = !searchQuery || b.exhibitorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const getBoothOpacity = (booth: Booth) => {
    if (activeSector === 'all' && !searchQuery) {return 1;}
    return filteredBooths.includes(booth) ? 1 : 0.18;
  };

  const occupiedCount = booths.filter(b => b.occupied).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 text-blue-600" />
                Plan Interactif des Halls — SIB 2026
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Parc d'Exposition Mohammed VI, El Jadida · 25–29 Novembre 2026 · {isLoadingBooths ? 'Chargement...' : `${occupiedCount}/${booths.length} stands occupés`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>
                Reset
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un exposant..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SECTORS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSector(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                    activeSector === s.id ? 'border-transparent text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                  }`}
                  style={activeSector === s.id ? { backgroundColor: s.color } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

        {/* SVG Map */}
        <div className="flex-1 min-w-0">
          <div
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            onMouseDown={e => { setIsPanning(true); setPanStart({ x: e.clientX - panX, y: e.clientY - panY }); }}
            onMouseMove={e => { if (isPanning) { setPanX(e.clientX - panStart.x); setPanY(e.clientY - panStart.y); } }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
          >
            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <svg
                viewBox="0 0 800 640"
                className="w-full"
                style={{
                  minWidth: `${Math.max(600, 800 * zoom)}px`,
                  transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                  transformOrigin: 'top left',
                  transition: isPanning ? 'none' : 'transform 0.15s',
                  display: 'block',
                }}
              >
                {/* BG */}
                <rect width="800" height="640" fill="#F1F5F9" />

                {/* Main corridors */}
                <rect x="398" y="0" width="24" height="640" fill="#CBD5E1" rx="2" />
                <rect x="0" y="298" width="800" height="24" fill="#CBD5E1" rx="2" />
                <text x="410" y="294" fontSize="9" fill="#94A3B8">Allée principale N-S</text>
                <text x="10" y="310" fontSize="9" fill="#94A3B8">Allée principale E-O</text>

                {/* Halls backgrounds */}
                {HALLS.map(hall => (
                  <g key={hall.id}>
                    <rect x={hall.x} y={hall.y} width={hall.width} height={hall.height} rx="10" fill={hall.bgColor} stroke={hall.color} strokeWidth="2.5" />
                    <text x={hall.x + 12} y={hall.y + 20} fontSize="13" fontWeight="bold" fill={hall.color}>{hall.name}</text>
                    <text x={hall.x + 12} y={hall.y + 34} fontSize="9" fill="#6B7280">{hall.theme}</text>
                  </g>
                ))}

                {/* Booths */}
                {booths.map(booth => {
                  const isSelected = selectedBooth?.id === booth.id;
                  const opacity = getBoothOpacity(booth);
                  return (
                    <g
                      key={booth.id}
                      onClick={() => setSelectedBooth(isSelected ? null : booth)}
                      style={{ cursor: 'pointer', opacity }}
                    >
                      <rect
                        x={booth.x} y={booth.y}
                        width={booth.width} height={booth.height}
                        rx="4"
                        fill={booth.occupied ? booth.color : '#CBD5E1'}
                        stroke={isSelected ? '#F59E0B' : (booth.occupied ? '#fff' : '#9CA3AF')}
                        strokeWidth={isSelected ? 3 : 1.5}
                        opacity={booth.occupied ? 0.88 : 0.5}
                      />
                      <text
                        x={booth.x + booth.width / 2} y={booth.y + booth.height / 2 - 5}
                        textAnchor="middle" fontSize="7.5" fill="white" fontWeight="bold"
                      >
                        {booth.id}
                      </text>
                      {booth.width > 52 && (
                        <text
                          x={booth.x + booth.width / 2} y={booth.y + booth.height / 2 + 7}
                          textAnchor="middle" fontSize="6" fill="white"
                        >
                          {booth.exhibitorName.slice(0, 13)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Entrance */}
                <rect x="320" y="622" width="160" height="18" rx="4" fill="#1E40AF" />
                <text x="400" y="633" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">▼ ENTRÉE PRINCIPALE</text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-gray-400" /> Légende
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SECTORS.filter(s => s.id !== 'all').map(s => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600">{s.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-sm bg-gray-200 border border-gray-300 flex-shrink-0" />
                <span className="text-gray-400">Disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <AnimatePresence mode="wait">
            {selectedBooth ? (
              <motion.div
                key="booth-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span
                          className="inline-block px-2 py-0.5 rounded text-white text-xs font-bold mb-2"
                          style={{ backgroundColor: selectedBooth.color }}
                        >
                          Stand {selectedBooth.id}
                        </span>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{selectedBooth.exhibitorName}</h3>
                      </div>
                      <button onClick={() => setSelectedBooth(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>{HALLS.find(h => h.id === selectedBooth.hall)?.name} — {HALLS.find(h => h.id === selectedBooth.hall)?.theme}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>Surface : {selectedBooth.surface}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedBooth.color }} />
                        <span className="text-gray-600">{SECTORS.find(s => s.id === selectedBooth.sector)?.label}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          selectedBooth.occupied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBooth.occupied ? '✓ Stand occupé' : '⚡ Disponible'}
                        </span>
                      </div>
                      {selectedBooth.certifications && selectedBooth.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {selectedBooth.certifications.map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedBooth.occupied && (
                      <Link
                        to={`${ROUTES.EXHIBITORS}/${selectedBooth.exhibitorId}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Voir le profil exposant <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {!selectedBooth.occupied && (
                      <Link
                        to={ROUTES.CONTACT}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium transition-colors"
                      >
                        Réserver ce stand <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Occupation des halls</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Total stands occupés</span>
                        <span className="font-semibold text-gray-900">{occupiedCount} / {BOOTHS.length}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(occupiedCount / BOOTHS.length) * 100}%` }} />
                      </div>
                      <div className="space-y-2 pt-1">
                        {HALLS.map(hall => {
                          const hb = BOOTHS.filter(b => b.hall === hall.id);
                          const occ = hb.filter(b => b.occupied).length;
                          return (
                            <div key={hall.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{hall.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full" style={{ width: `${(occ / hb.length) * 100}%`, backgroundColor: hall.color }} />
                                </div>
                                <span className="font-medium text-xs" style={{ color: hall.color }}>{occ}/{hb.length}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sector Breakdown */}
          <Card>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" /> Répartition sectorielle
              </h3>
              <div className="space-y-2">
                {SECTORS.filter(s => s.id !== 'all').map(s => {
                  const count = BOOTHS.filter(b => b.sector === s.id && b.occupied).length;
                  if (count === 0) {return null;}
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSector(activeSector === s.id ? 'all' : s.id)}
                      className={`w-full flex items-center justify-between text-sm p-2 rounded-lg transition-colors ${
                        activeSector === s.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-600">{s.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 Navigation</p>
            <p>Cliquez sur un stand pour voir les détails. Faites glisser la carte pour la déplacer, utilisez les boutons +/- pour zoomer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
