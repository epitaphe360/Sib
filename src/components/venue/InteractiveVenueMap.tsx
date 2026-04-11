import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exhibitor } from '../../types';
import { SupabaseService } from '../../services/supabaseService';

interface BoothPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  exhibitorId: string;
}

const InteractiveVenueMap: React.FC = () => {
  const navigate = useNavigate();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitors = async () => {
      setLoading(true);
      const data = await SupabaseService.getExhibitors();
      setExhibitors(data.filter((exhibitor) => exhibitor.standNumber));
      setLoading(false);
    };

    fetchExhibitors();
  }, []);

  // Générer les positions des stands en fonction du numéro de stand
  const generateBoothPosition = (standNumber: string): BoothPosition | null => {
    // Extraire le numéro du stand (ex: "A1" -> 1, "B2" -> 2)
    const match = standNumber.match(/([A-Z])(\d+)/);
    if (!match) return null;

    const [, row, number] = match;
    const rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
    const colIndex = parseInt(number, 10) - 1;

    // Calculer la position en fonction de la grille
    const boothWidth = 120;
    const boothHeight = 100;
    const spacing = 20;

    return {
      x: 50 + colIndex * (boothWidth + spacing),
      y: 50 + rowIndex * (boothHeight + spacing),
      width: boothWidth,
      height: boothHeight,
      exhibitorId: '',
    };
  };

  const handleBoothClick = (exhibitorId: string) => {
    navigate(`/exhibitors/${exhibitorId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan de l'Événement</h2>
      
      <div className="relative overflow-auto border border-gray-300 rounded-lg" style={{ height: '600px' }}>
        <svg
          width="1200"
          height="800"
          className="bg-gray-50"
          style={{ minWidth: '1200px', minHeight: '800px' }}
        >
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Légende des zones */}
          <text x="50" y="30" fontSize="16" fontWeight="bold" fill="#374151">
            Zone A
          </text>
          <text x="50" y="180" fontSize="16" fontWeight="bold" fill="#374151">
            Zone B
          </text>
          <text x="50" y="330" fontSize="16" fontWeight="bold" fill="#374151">
            Zone C
          </text>

          {/* Afficher les stands des exposants */}
          {exhibitors.map((exhibitor) => {
            if (!exhibitor.standNumber) return null;

            const position = generateBoothPosition(exhibitor.standNumber);
            if (!position) return null;

            const isSelected = selectedBooth === exhibitor.id;

            return (
              <g
                key={exhibitor.id}
                onMouseEnter={() => setSelectedBooth(exhibitor.id)}
                onMouseLeave={() => setSelectedBooth(null)}
                onClick={() => handleBoothClick(exhibitor.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Rectangle du stand */}
                <rect
                  x={position.x}
                  y={position.y}
                  width={position.width}
                  height={position.height}
                  fill={isSelected ? '#3b82f6' : '#e0f2fe'}
                  stroke={isSelected ? '#1d4ed8' : '#0284c7'}
                  strokeWidth={isSelected ? 3 : 2}
                  rx="8"
                  className="transition-all duration-200"
                />

                {/* Rectangle du stand */}
                <rect
                  x={position.x}
                  y={position.y}
                  width={position.width}
                  height={position.height}
                  fill={isSelected ? '#3b82f6' : '#e0f2fe'}
                  stroke={isSelected ? '#1d4ed8' : '#0284c7'}
                  strokeWidth={isSelected ? 3 : 2}
                  rx="8"
                  className="transition-all duration-200"
                />

                {/* Numéro de stand */}
                <text
                  x={position.x + position.width / 2}
                  y={position.y + 20}
                  fontSize="16"
                  fontWeight="bold"
                  fill={isSelected ? '#ffffff' : '#0c4a6e'}
                  textAnchor="middle"
                >
                  {exhibitor.standNumber}
                </text>

                {/* Nom de l'entreprise */}
                <text
                  x={position.x + position.width / 2}
                  y={position.y + 40}
                  fontSize="10"
                  fill={isSelected ? '#ffffff' : '#374151'}
                  textAnchor="middle"
                  style={{
                    maxWidth: `${position.width - 10}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {exhibitor.companyName.length > 18
                    ? `${exhibitor.companyName.substring(0, 18)}...`
                    : exhibitor.companyName}
                </text>

                {/* Catégorie */}
                <text
                  x={position.x + position.width / 2}
                  y={position.y + 55}
                  fontSize="8"
                  fill={isSelected ? '#e0f2fe' : '#6b7280'}
                  textAnchor="middle"
                >
                  {exhibitor.category}
                </text>

                {/* Secteur */}
                <text
                  x={position.x + position.width / 2}
                  y={position.y + 70}
                  fontSize="8"
                  fill={isSelected ? '#e0f2fe' : '#6b7280'}
                  textAnchor="middle"
                >
                  {exhibitor.sector}
                </text>

                {/* Badge vérifié */}
                {exhibitor.verified && (
                  <circle
                    cx={position.x + position.width - 10}
                    cy={position.y + 10}
                    r="6"
                    fill="#10b981"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Légende */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-100 border-2 border-sky-600 rounded"></div>
          <span>Stand disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border-2 border-blue-800 rounded"></div>
          <span>Stand sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Exposant vérifié</span>
        </div>
      </div>

      {/* Informations sur le stand sélectionné */}
      {selectedBooth && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {(() => {
            const exhibitor = exhibitors.find((e) => e.id === selectedBooth);
            if (!exhibitor) return null;

            return (
              <div className="flex items-start gap-4">
                {exhibitor.logo && (
                  <img
                    src={exhibitor.logo}
                    alt={exhibitor.companyName}
                    className="w-16 h-16 object-contain rounded-lg bg-white p-2"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {exhibitor.companyName}
                    {exhibitor.verified && (
                      <span className="ml-2 text-green-600 text-sm">✓ Vérifié</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{exhibitor.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span>Stand: {exhibitor.standNumber}</span>
                    <span>Catégorie: {exhibitor.category}</span>
                    <span>Secteur: {exhibitor.sector}</span>
                    {exhibitor.website && (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Site Web
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleBoothClick(exhibitor.id)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir la fiche complète
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InteractiveVenueMap;
