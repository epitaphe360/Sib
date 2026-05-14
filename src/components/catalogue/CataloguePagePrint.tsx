import React from 'react';
import { CatalogueFicheCard, CatalogueEntry } from './CatalogueFicheCard';

interface CataloguePagePrintProps {
  entries: CatalogueEntry[];
  title?: string;
}

/**
 * CataloguePagePrint — Rendu imprimable du catalogue exposants SIB 2026
 * 3 fiches par page A4, séparateur entre chaque groupe de 3
 */
export const CataloguePagePrint: React.FC<CataloguePagePrintProps> = ({
  entries,
  title = 'Catalogue Officiel SIB 2026',
}) => {
  // Grouper par tranches de 3
  const pages: CatalogueEntry[][] = [];
  for (let i = 0; i < entries.length; i += 3) {
    pages.push(entries.slice(i, i + 3));
  }

  return (
    <>
      {/* ─── STYLES PRINT ────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #catalogue-print-root,
          #catalogue-print-root * { visibility: visible; }
          #catalogue-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .catalogue-page-break {
            page-break-after: always;
          }
          .catalogue-no-screen {
            display: block !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
        @media screen {
          #catalogue-print-root {
            max-width: 794px;
            margin: 0 auto;
          }
        }
      `}</style>

      <div id="catalogue-print-root" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

        {/* ─── PAGE DE COUVERTURE ──────────────────────────────────── */}
        <div className="catalogue-page-break" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div
            style={{
              background: '#0B1C3D',
              color: 'white',
              borderRadius: 12,
              padding: '60px 40px',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 4,
                color: '#C9A84C',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              SALON INTERNATIONAL DU BÂTIMENT
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 4, marginBottom: 8 }}>
              SIB 2026
            </div>
            <div
              style={{
                width: 80,
                height: 3,
                background: '#C9A84C',
                margin: '16px auto',
              }}
            />
            <div style={{ fontSize: 18, color: '#94a3b8', marginBottom: 8 }}>
              25 — 29 Novembre 2026
            </div>
            <div style={{ fontSize: 14, color: '#64748b' }}>
              Parc d'Exposition Mohammed VI · El Jadida, Maroc
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 700, color: '#0B1C3D', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {entries.length} exposant{entries.length > 1 ? 's' : ''} répertorié{entries.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* ─── PAGES DE FICHES (3 fiches/page) ──────────────────────── */}
        {pages.map((pageEntries, pageIndex) => (
          <div
            key={pageIndex}
            className={pageIndex < pages.length - 1 ? 'catalogue-page-break' : ''}
            style={{ padding: '0 0 16px 0' }}
          >
            {pageEntries.map((entry, entryIndex) => (
              <div key={entry.id}>
                <CatalogueFicheCard entry={entry} printMode />
                {/* Séparateur entre fiches (sauf la dernière de la page) */}
                {entryIndex < pageEntries.length - 1 && (
                  <div
                    style={{
                      borderBottom: '2px dashed #e2e8f0',
                      margin: '0',
                    }}
                  />
                )}
              </div>
            ))}

            {/* Compléter avec des fiches vides si < 3 */}
            {pageEntries.length < 3 &&
              Array.from({ length: 3 - pageEntries.length }).map((_, i) => (
                <div key={`empty-${i}`}>
                  <div
                    style={{
                      borderBottom: '2px dashed #e2e8f0',
                      margin: '0',
                    }}
                  />
                  <div
                    style={{
                      height: 155,
                      background: '#fafafa',
                      border: '1px dashed #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#cbd5e1',
                      fontSize: 11,
                    }}
                  >
                    espace réservé
                  </div>
                </div>
              ))}
          </div>
        ))}

      </div>
    </>
  );
};

export default CataloguePagePrint;
