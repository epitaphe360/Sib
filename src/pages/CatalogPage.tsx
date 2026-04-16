import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, ExternalLink, Star, ChevronDown, X,
  BookOpen, Award, Package, Layers, Cpu, Wrench, Building, Check
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/routes';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  name: string;
  exhibitorId: string;
  exhibitorName: string;
  category: string;
  lot: string;
  description: string;
  certifications: string[];
  region: string[];
  phase: string[];
  featured: boolean;
  pdfUrl?: string;
  specs: Record<string, string>;
  tags: string[];
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'Toutes catégories', icon: Layers, color: '#6B7280' },
  { id: 'gros_oeuvre', label: 'Gros Oeuvre', icon: Building, color: '#1D4ED8' },
  { id: 'second_oeuvre', label: 'Second Oeuvre', icon: Layers, color: '#059669' },
  { id: 'mep_cvc', label: 'MEP / CVC', icon: Wrench, color: '#D97706' },
  { id: 'finitions', label: 'Finitions', icon: Star, color: '#7C3AED' },
  { id: 'materiaux', label: 'Matériaux & Produits', icon: Package, color: '#0891B2' },
  { id: 'innovation', label: 'Innovation & Logiciels', icon: Cpu, color: '#DC2626' },
];

const LOTS_BTP = [
  'Terrassement & VRD', 'Fondations', 'Gros Oeuvre béton', 'Charpente métallique',
  'Cloisons & Isolation', 'Plomberie sanitaire', 'Électricité CFO/CFA',
  'Climatisation & Ventilation', 'Carrelage & Revêtements', 'Peinture & Finitions',
  'Menuiserie bois', 'Menuiserie aluminium', 'Étanchéité', 'Façades & Bardage',
  'Sécurité incendie', 'Énergie solaire', 'BIM & Maquette numérique',
];

const CERTIFICATIONS = ['QUALIBAT', 'OPQCB', 'ISO 9001', 'ISO 14001', 'CE', 'ONEE', 'NF', 'REACH'];
const REGIONS = ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Marrakech-Safi', 'Fès-Meknès', 'Souss-Massa', 'National'];
const PHASES = ['Conception / Études', 'Construction / Exécution', 'Réception / Livraison', 'Maintenance'];

const STATIC_PRODUCTS: CatalogProduct[] = [
  {
    id: 'P001', name: 'Ciment Portland CPJ 45', exhibitorId: '1', exhibitorName: 'Ciment du Maroc',
    category: 'gros_oeuvre', lot: 'Gros Oeuvre béton',
    description: 'Ciment Portland composé CPJ 45 adapté aux ouvrages courants en béton armé et béton de masse. Résistance prouvée aux conditions climatiques marocaines.',
    certifications: ['NF', 'ISO 9001', 'CE'], region: ['National'], phase: ['Construction / Exécution'],
    featured: true, pdfUrl: '#',
    specs: { 'Résistance 28j': '≥ 42.5 MPa', 'Prise initiale': '≥ 75 min', 'Conditionnement': 'Sac 50kg / Vrac' },
    tags: ['ciment', 'béton', 'structure'],
  },
  {
    id: 'P002', name: 'Béton Prêt à l\'Emploi C25/30', exhibitorId: '3', exhibitorName: 'Société des Bétons',
    category: 'gros_oeuvre', lot: 'Gros Oeuvre béton',
    description: 'Béton prêt à l\'emploi certifié, livré sur chantier en toupie. Formulations adaptées à chaque usage structural : radiers, poteaux, poutres, dalles.',
    certifications: ['CE', 'ISO 9001'], region: ['Casablanca-Settat', 'Rabat-Salé-Kénitra'],
    phase: ['Construction / Exécution'], featured: false, pdfUrl: '#',
    specs: { 'Résistance caractéristique': '25–30 MPa', 'Slump': '10–16 cm', 'Livraison': 'En toupie 7m³' },
    tags: ['béton', 'coulage', 'dalles'],
  },
  {
    id: 'P003', name: 'Système d\'ossature acier légère', exhibitorId: '4', exhibitorName: 'Acier Maroc',
    category: 'gros_oeuvre', lot: 'Charpente métallique',
    description: 'Ossature acier légère galvanisée pour constructions industrielles, entrepôts et bâtiments commerciaux. Montage rapide, performance sismique certifiée.',
    certifications: ['ISO 9001', 'CE'], region: ['National'], phase: ['Conception / Études', 'Construction / Exécution'],
    featured: true, pdfUrl: '#',
    specs: { 'Acier': 'S280 GD galvanisé', 'Inertie': '150- en HEA/HEB', 'Délai montage': '< 30 jours/1000m²' },
    tags: ['acier', 'charpente', 'structure'],
  },
  {
    id: 'P004', name: 'Système de cloisons à double ossature', exhibitorId: '18', exhibitorName: 'Cloisons & Plafonds',
    category: 'second_oeuvre', lot: 'Cloisons & Isolation',
    description: 'Cloisons plâtre à double ossature métallique pour logements et bureaux. Excellentes performances acoustiques et thermiques.',
    certifications: ['QUALIBAT', 'NF'], region: ['National'], phase: ['Construction / Exécution'],
    featured: false, pdfUrl: '#',
    specs: { 'Indice affaiblissement acoustique Rw': '≥ 53 dB', 'Isolation thermique R': '1.5 m²K/W', 'Hauteur max': '6 m' },
    tags: ['cloison', 'acoustic', 'plâtre'],
  },
  {
    id: 'P005', name: 'Groupe de climatisation CVC inverter', exhibitorId: '22', exhibitorName: 'Climatisation Atlas',
    category: 'mep_cvc', lot: 'Climatisation & Ventilation',
    description: 'Gamme de groupes de climatisation inverter haute efficacité pour bureaux, hôtels et grandes surfaces. Classe énergétique A+++.',
    certifications: ['ONEE', 'ISO 9001', 'CE'], region: ['National'],
    phase: ['Construction / Exécution', 'Maintenance'], featured: true, pdfUrl: '#',
    specs: { 'EER': '≥ 5.2', 'COP': '≥ 5.8', 'Puissances': '3 à 150 kW', 'Fluide réfrigérant': 'R32' },
    tags: ['cvc', 'climatisation', 'énergie'],
  },
  {
    id: 'P006', name: 'Carrelage grès cérame rectifié 60×60', exhibitorId: '15', exhibitorName: 'Carrelage Prestige',
    category: 'finitions', lot: 'Carrelage & Revêtements',
    description: 'Carrelage grès cérame rectifié résistant au gel, slip-resistant, pour sols et murs intérieurs / extérieurs. Large gamme de finitions et formats.',
    certifications: ['CE', 'NF'], region: ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Marrakech-Safi'],
    phase: ['Construction / Exécution'], featured: true, pdfUrl: '#',
    specs: { 'Format': '60×60 cm rectifié', 'Abrasion PEI': 'IV/V', 'Anti-dérapance': 'R11', 'Absorption eau': '< 0.5%' },
    tags: ['carrelage', 'sol', 'revêtement'],
  },
  {
    id: 'P007', name: 'Logiciel BIM Revit MA - Licence', exhibitorId: '28', exhibitorName: 'BIM Solutions MA',
    category: 'innovation', lot: 'BIM & Maquette numérique',
    description: 'Suite BIM locale conforme aux normes BNPB marocaines. Collaboration multi-disciplinaire, coordination 3D, extraction automatique des quantitatifs.',
    certifications: ['ISO 9001'], region: ['National'],
    phase: ['Conception / Études'], featured: true, pdfUrl: '#',
    specs: { 'Normes': 'IFC 4.0 / LOD 200–500', 'Formats': 'DWG, IFC, PDF, XLS', 'Support': 'Arabe + Français' },
    tags: ['BIM', 'maquette', 'logiciel', 'numérique'],
  },
  {
    id: 'P008', name: 'Système de plomberie PER multicouche', exhibitorId: '21', exhibitorName: 'Plomberie Expert',
    category: 'mep_cvc', lot: 'Plomberie sanitaire',
    description: 'Réseau de distribution d\'eau sanitaire en tube PER multicouche. Installation rapide, anti-corrosion, hygiénique.',
    certifications: ['QUALIBAT', 'CE'], region: ['National'],
    phase: ['Construction / Exécution'], featured: false, pdfUrl: '#',
    specs: { 'Diamètres': 'DN 16 à DN 110', 'Pression max': '10 bar', 'Température': '-20°C à +95°C' },
    tags: ['plomberie', 'eau sanitaire', 'PER'],
  },
  {
    id: 'P009', name: 'Panneaux sandwich EPS pour façade', exhibitorId: '20', exhibitorName: 'Façades & Bardage',
    category: 'second_oeuvre', lot: 'Façades & Bardage',
    description: 'Panneaux sandwich à âme en polystyrène expansé pour isolation de façades. Système de bardage ventilé certifié résistance au vent et au feu.',
    certifications: ['QUALIBAT', 'CE', 'NF'], region: ['National'],
    phase: ['Construction / Exécution'], featured: false, pdfUrl: '#',
    specs: { 'R thermique': '3.5 m²K/W', 'Réaction au feu': 'C-s1,d0', 'Epaisseurs': '80 / 100 / 120mm' },
    tags: ['isolation', 'façade', 'bardage'],
  },
  {
    id: 'P010', name: 'Centrale solaire sur toiture 100 kWc', exhibitorId: '26', exhibitorName: 'Énergie Solaire MA',
    category: 'mep_cvc', lot: 'Énergie solaire',
    description: 'Installation photovoltaïque clé en main pour bâtiments tertiaires et industriels. Étude de faisabilité, fourniture, pose, raccordement ONEE et maintenance.',
    certifications: ['ONEE', 'ISO 9001', 'CE'], region: ['National'],
    phase: ['Conception / Études', 'Construction / Exécution', 'Maintenance'],
    featured: true, pdfUrl: '#',
    specs: { 'Puissance': '10 à 5000 kWc', 'Panneau': 'Monocristallin PERC 400Wc', 'Garantie': '25 ans production' },
    tags: ['solaire', 'photovoltaïque', 'énergie renouvelable'],
  },
  {
    id: 'P011', name: 'Détection incendie NOTIFIER™ ENS', exhibitorId: '35', exhibitorName: 'Sécurité Incendie',
    category: 'mep_cvc', lot: 'Sécurité incendie',
    description: 'Système de détection incendie adressable. Centrale de détection, détecteurs optiques et ioniques, déclencheurs manuels conforme NM 17.3.009.',
    certifications: ['CE', 'NF', 'QUALIBAT'], region: ['National'],
    phase: ['Construction / Exécution', 'Réception / Livraison'],
    featured: false, pdfUrl: '#',
    specs: { 'Norme': 'NM 17.3.009 / EN54', 'Boucles': 'jusqu\'à 127 adresses', 'Communication': 'RS232 / Ethernet' },
    tags: ['incendie', 'détection', 'sécurité'],
  },
  {
    id: 'P012', name: 'Drone de relevé topographique BTP', exhibitorId: '29', exhibitorName: 'Drone BTP',
    category: 'innovation', lot: 'BIM & Maquette numérique',
    description: 'Service de relevé topographique par drone: plans, cubatures, modèles 3D, plans d\'exécution. Précision centimétrique, rapport en 48h.',
    certifications: ['ISO 9001'], region: ['National'],
    phase: ['Conception / Études'],
    featured: true, pdfUrl: '#',
    specs: { 'Précision': '± 2 cm', 'Livrable': 'Orthophoto, MNT, Nuage de points', 'Délai livrables': '48h' },
    tags: ['drone', 'topographie', 'relevé'],
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  const cat = CATEGORIES.find(c => c.id === category);
  const Icon = cat?.icon || Package;
  return <Icon className={className} />;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>(STATIC_PRODUCTS);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLot, setSelectedLot] = useState('');
  const [selectedCert, setSelectedCert] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    const loadCatalogFromDb = async () => {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, exhibitor_id, name, description, category, specifications, featured')
          .order('created_at', { ascending: false });

        if (productsError || !productsData || productsData.length === 0) {
          setProducts(STATIC_PRODUCTS);
          return;
        }

        const exhibitorIds = Array.from(new Set(productsData.map((p: any) => p.exhibitor_id).filter(Boolean)));
        let exhibitorsById: Record<string, any> = {};

        if (exhibitorIds.length > 0) {
          const { data: exhibitorsData } = await supabase
            .from('exhibitors')
            .select('id, company_name, sector')
            .in('id', exhibitorIds);

          exhibitorsById = (exhibitorsData || []).reduce((acc: Record<string, any>, e: any) => {
            acc[e.id] = e;
            return acc;
          }, {});
        }

        const dbProducts: CatalogProduct[] = productsData.map((p: any, idx: number) => {
          const exhibitor = exhibitorsById[p.exhibitor_id] || {};
          const rawCategory = (p.category || exhibitor.sector || 'materiaux').toLowerCase();
          const normalizedCategory = rawCategory.includes('gros') ? 'gros_oeuvre'
            : rawCategory.includes('second') ? 'second_oeuvre'
            : rawCategory.includes('mep') || rawCategory.includes('cvc') || rawCategory.includes('electric') ? 'mep_cvc'
            : rawCategory.includes('finition') ? 'finitions'
            : rawCategory.includes('innov') || rawCategory.includes('bim') || rawCategory.includes('digital') ? 'innovation'
            : 'materiaux';

          const specs = (typeof p.specifications === 'object' && p.specifications !== null) ? p.specifications : {};
          const specsRecord = Object.keys(specs).length > 0
            ? specs
            : { 'Fiche': 'Spécifications disponibles sur demande' };

          return {
            id: String(p.id || `DB-${idx + 1}`),
            name: p.name || 'Produit BTP',
            exhibitorId: String(p.exhibitor_id || ''),
            exhibitorName: exhibitor.company_name || 'Exposant SIB',
            category: normalizedCategory,
            lot: LOTS_BTP[idx % LOTS_BTP.length],
            description: p.description || 'Description technique non renseignée.',
            certifications: ['CE'],
            region: ['National'],
            phase: ['Construction / Exécution'],
            featured: !!p.featured,
            pdfUrl: '#',
            specs: specsRecord,
            tags: [normalizedCategory, 'btp', 'sib2026'],
          };
        });

        setProducts(dbProducts.length > 0 ? dbProducts : STATIC_PRODUCTS);
      } catch {
        setProducts(STATIC_PRODUCTS);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCatalogFromDb();
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) {return false;}
      if (selectedLot && p.lot !== selectedLot) {return false;}
      if (selectedCert && !p.certifications.includes(selectedCert)) {return false;}
      if (selectedRegion && !p.region.includes(selectedRegion) && !p.region.includes('National')) {return false;}
      if (selectedPhase && !p.phase.includes(selectedPhase)) {return false;}
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.exhibitorName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.includes(q))
        );
      }
      return true;
    });
  }, [products, searchQuery, activeCategory, selectedLot, selectedCert, selectedRegion, selectedPhase]);

  const hasFilters = selectedLot || selectedCert || selectedRegion || selectedPhase;

  const clearFilters = () => {
    setSelectedLot(''); setSelectedCert(''); setSelectedRegion(''); setSelectedPhase('');
  };

  const catColor = CATEGORIES.find(c => c.id === activeCategory)?.color || '#6B7280';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Catalogue Technique BTP — SIB 2026
              </h1>
              <p className="text-gray-500 text-sm">
                {isLoadingData ? 'Chargement du catalogue...' : `${filtered.length} produit${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(f => !f)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtres {hasFilters && <span className="ml-1 w-2 h-2 rounded-full bg-blue-600 inline-block" />}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit, une marque, une technologie..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    activeCategory === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">

        {/* Filter Sidebar (collapsible) */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0"
          >
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">Filtres avancés</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <X className="h-3 w-3" /> Effacer
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <FilterSelect label="Lot BTP" value={selectedLot} onChange={setSelectedLot} options={LOTS_BTP} />
                  <FilterSelect label="Certification" value={selectedCert} onChange={setSelectedCert} options={CERTIFICATIONS} />
                  <FilterSelect label="Région" value={selectedRegion} onChange={setSelectedRegion} options={REGIONS} />
                  <FilterSelect label="Phase chantier" value={selectedPhase} onChange={setSelectedPhase} options={PHASES} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun produit ne correspond à vos critères.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); clearFilters(); setActiveCategory('all'); }}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <div className="p-5 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${catColor}15` }}>
                            <CategoryIcon category={product.category} className="h-4 w-4" style={{ color: catColor }} />
                          </div>
                          {product.featured && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">⭐ Vedette</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{product.id}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
                      <p className="text-xs text-blue-600 font-medium mb-2">{product.exhibitorName}</p>
                      <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-3">{product.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{product.lot}</span>
                        {product.certifications.slice(0, 2).map(c => (
                          <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 flex items-center gap-1">
                            <Award className="h-2.5 w-2.5" /> {c}
                          </span>
                        ))}
                        {product.certifications.length > 2 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">+{product.certifications.length - 2}</span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {product.region.slice(0, 1).map(r => (
                            <span key={r} className="text-xs text-gray-400">{r}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {product.pdfUrl && (
                            <button
                              onClick={e => { e.stopPropagation(); }}
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                              <Download className="h-3.5 w-3.5" /> Fiche
                            </button>
                          )}
                          <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                            Détails <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 font-mono">{selectedProduct.id}</span>
                    {selectedProduct.featured && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">⭐ Vedette</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-blue-600 font-medium text-sm mt-0.5">{selectedProduct.exhibitorName}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-5">{selectedProduct.description}</p>

              {/* Specs */}
              {Object.keys(selectedProduct.specs).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">Caractéristiques techniques</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium text-gray-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 mb-1.5">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.certifications.map(c => (
                      <span key={c} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                        <Check className="h-3 w-3" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1.5">Phases chantier</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.phase.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Lot BTP</p>
                  <p className="text-gray-600 text-xs">{selectedProduct.lot}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Régions couvertes</p>
                  <p className="text-gray-600 text-xs">{selectedProduct.region.join(', ')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Link
                  to={`${ROUTES.EXHIBITORS}/${selectedProduct.exhibitorId}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Voir l'exposant
                </Link>
                {selectedProduct.pdfUrl && (
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                    <Download className="h-4 w-4" /> Fiche PDF
                  </button>
                )}
                <Link
                  to={`${ROUTES.CONTACT}?subject=Demande+devis+${selectedProduct.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                >
                  Demander devis
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// FilterSelect helper
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tous</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
