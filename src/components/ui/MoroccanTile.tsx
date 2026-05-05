/**
 * ZelligePattern — Tessellation girih (octogone + carré + étoile),
 * style architecture islamique marocaine authentique.
 * Aucun hook React — sûr pour Vite HMR/SSR.
 */
export function ZelligePattern({ opacity = 0.1 }: { readonly opacity?: number }) {
  const id = 'sib-girih';

  // Octogone dans une tuile 44×44px (coins coupés à 11px)
  const oct = '11,0 33,0 44,11 44,33 33,44 11,44 0,33 0,11';

  // Étoile 8 branches : deux carrés superposés tournés de 45°, inscrits dans l'octogone
  const star8 = '22,6 25,18.5 38,22 25,25.5 22,38 19,25.5 6,22 19,18.5';

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
          {/* Fond de l'octogone */}
          <polygon points={oct} fill="white" fillOpacity={opacity * 0.25} />
          {/* Contour de l'octogone (joint de zellige) */}
          <polygon points={oct} fill="none" stroke="white" strokeOpacity={opacity * 2.2} strokeWidth="0.9" />
          {/* Étoile 8 branches intérieure */}
          <polygon points={star8} fill="white" fillOpacity={opacity * 0.55} />
          {/* Cercle central */}
          <circle cx="22" cy="22" r="3.5" fill="white" fillOpacity={opacity * 1.3} />
          {/* Petits carrés de jonction aux 4 coins */}
          <rect x="0"  y="0"  width="11" height="11" fill="white" fillOpacity={opacity * 0.22} />
          <rect x="33" y="0"  width="11" height="11" fill="white" fillOpacity={opacity * 0.22} />
          <rect x="0"  y="33" width="11" height="11" fill="white" fillOpacity={opacity * 0.22} />
          <rect x="33" y="33" width="11" height="11" fill="white" fillOpacity={opacity * 0.22} />
          {/* Croix légère dans les carrés de coin */}
          <line x1="5.5" y1="0"  x2="5.5" y2="11" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="0"   y1="5.5" x2="11"  y2="5.5" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="38.5" y1="0"  x2="38.5" y2="11" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="33"   y1="5.5" x2="44"  y2="5.5" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="5.5" y1="33" x2="5.5" y2="44" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="0"   y1="38.5" x2="11" y2="38.5" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="38.5" y1="33" x2="38.5" y2="44" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
          <line x1="33"   y1="38.5" x2="44" y2="38.5" stroke="white" strokeOpacity={opacity * 0.9} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * ZelligeBand — Frise architecturale marocaine : deux rangées de triangles entrelacés.
 * Reproduit la moulure en dents-de-scie des frises de zellige traditionnelles.
 * Couleurs SIB : bleu #00AEEF, vert #52B847, rouge #E63329.
 */
export function ZelligeBand({ className = '' }: { readonly className?: string }) {
  const TW = 24;  // largeur de base d'un triangle
  const TH = 14;  // hauteur d'un triangle
  const H  = TH * 2; // hauteur totale : 2 rangées
  const COUNT = 120;
  const VW = TW * COUNT;
  const COLORS = ['#00AEEF', '#52B847', '#E63329'];

  // Pré-calcul avec clés stables (position x, pas index)
  const topRow = Array.from({ length: COUNT }, (_, i) => ({
    key: `tp${i * TW}`,
    x: i * TW,
    color: COLORS[i % 3],
  }));

  const botRow = Array.from({ length: COUNT + 1 }, (_, i) => ({
    key: `bt${i * TW}`,
    x: i * TW - TW / 2,
    color: COLORS[(i + 1) % 3],
  }));

  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden ${className}`}
      style={{ height: `${H}px` }}
    >
      <svg
        viewBox={`0 0 ${VW} ${H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={VW} height={H} fill="white" />

        {/* Rangée supérieure : triangles pointant vers le bas */}
        {topRow.map(({ key, x, color }) => (
          <polygon
            key={key}
            points={`${x},0 ${x + TW},0 ${x + TW / 2},${TH}`}
            fill={color}
          />
        ))}

        {/* Joint blanc central */}
        <line x1="0" y1={TH} x2={VW} y2={TH} stroke="white" strokeWidth="2" />

        {/* Rangée inférieure : triangles pointant vers le haut, décalés de TW/2 */}
        {botRow.map(({ key, x, color }) => (
          <polygon
            key={key}
            points={`${x + TW / 2},${H} ${x + TW * 1.5},${H} ${x + TW},${TH}`}
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
}
