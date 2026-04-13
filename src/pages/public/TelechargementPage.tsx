import React from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import { ScrollReveal, HeroReveal, fadeUp, fadeLeft } from '../../components/ui/motion';

interface DocGroup {
  year: string;
  label: string;
  docs: { name: string; url: string; size?: string }[];
}

const documents: DocGroup[] = [
  {
    year: '2026',
    label: 'SIB 2026 — 20ème Édition',
    docs: [
      { name: 'Brochure SIB 2026', url: 'https://sib.ma/backend/uploads/Brochure_SIB_2026_F_3175004ace.pdf', size: 'PDF' },
    ],
  },
  {
    year: '2024',
    label: 'SIB 2024 — 19ème Édition',
    docs: [
      { name: 'Catalogue SIB 2024', url: 'https://sib.ma/backend/uploads/Catalogue_SIB_2024_V_WEB_75e975a0bd.pdf', size: 'PDF' },
      { name: 'Brochure SIB 2024', url: 'https://sib.ma/backend/uploads/Brochure_SIB_2024_e33d374da5.pdf', size: 'PDF' },
      { name: 'Bilan SIB 2024', url: 'https://sib.ma/backend/uploads/Bilan_SIB_2024_VF_5199ead49d.pdf', size: 'PDF' },
      { name: 'Programme Scientifique - SIB 2024', url: 'https://sib.ma/backend/uploads/Programme_Scientifique_SIB_2024_953ee08ac1.pdf', size: 'PDF' },
      { name: 'Programme B2B - SIB 2024', url: 'https://sib.ma/backend/uploads/Programme_B2_B_SIB_2024_8785d47132.pdf', size: 'PDF' },
    ],
  },
  {
    year: '2022',
    label: 'SIB 2022 — 18ème Édition',
    docs: [
      { name: 'Catalogue SIB 2022', url: 'https://sib.ma/backend/uploads/Catalogue_SIB_2022_bc3f8ebfb0.pdf', size: 'PDF' },
      { name: 'Programme B2B', url: 'https://sib.ma/backend/uploads/Programme_B2_B_SIB_2022_0273f6f7af.pdf', size: 'PDF' },
      { name: 'First Conference Smart Safe Cities SIB 2022', url: 'https://sib.ma/backend/uploads/Programme_First_Conference_Smart_Safe_Cities_SIB_2022_f7d8a5062f_2ff3e9dae2.pdf', size: 'PDF' },
      { name: 'Programme Scientifique', url: 'https://sib.ma/backend/uploads/Programme_Scientifique_SIB_2022_2293d2df93_1_050c5c2ed4.pdf', size: 'PDF' },
      { name: 'Programme Women', url: 'https://sib.ma/backend/uploads/Programme_Women_SIB_2022_0c8490ecbc_be4fa6cd6d.pdf', size: 'PDF' },
      { name: 'Programme CETEMCO', url: 'https://sib.ma/backend/uploads/programme_cetemco_59ad7bc445.pdf', size: 'PDF' },
    ],
  },
  {
    year: '2018',
    label: 'SIB 2018 — 17ème Édition',
    docs: [
      { name: 'Bilan SIB 2018', url: 'https://sib.ma/backend/uploads/Bilan_SIB_2018_1_ad219f25d1.pdf', size: 'PDF' },
      { name: 'Catalogue SIB 2018', url: 'https://sib.ma/backend/uploads/Catalogue_SIB_2018_6e3b39031c.pdf', size: 'PDF' },
    ],
  },
];

export default function TelechargementPage() {
  const cms = usePageContent('telechargements');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <HeroReveal>
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Téléchargements'}</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {cms.hero_subtitle || 'Retrouvez les brochures, bilans et dossiers de presse des différentes éditions du SIB.'}
          </p>
        </div>
      </div>
      </HeroReveal>

      {/* Documents */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {documents.map((group, gi) => (
            <ScrollReveal key={group.year} variant={fadeLeft} delay={gi * 0.1}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-sib-gold" />
                <h2 className="text-2xl font-bold text-sib-navy font-display">{group.label}</h2>
              </div>
              <div className="grid gap-3">
                {group.docs.map((doc, i) => (
                  <ScrollReveal key={i} variant={fadeUp} delay={i * 0.05}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-sib-gold/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-sib-navy transition-colors">
                          {doc.name}
                        </div>
                        {doc.size && (
                          <div className="text-xs text-gray-400 mt-0.5">{doc.size}</div>
                        )}
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-300 group-hover:text-sib-gold transition-colors" />
                  </a>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
