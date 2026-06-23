/**
 * Corrige le texte français mal encodé (mojibake UTF-8 / Latin-1, caractères de remplacement).
 * Utilisé pour le contenu CMS Supabase et les fallbacks historiques.
 */
export function fixFrenchEncoding(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let result = text;

  // UTF-8 lu comme Latin-1 : Ã© → é, Ã¨ → è, etc.
  if (/Ã[\x80-\xBF]/.test(result) || result.includes('â€™') || result.includes('â€"')) {
    try {
      result = decodeURIComponent(escape(result));
    } catch {
      /* keep original */
    }
  }

  // Caractère de remplacement Unicode (souvent é, è, à, ô, û, î, ç, œ mal encodés)
  const replacements: Array<[RegExp, string]> = [
    [/repr.sent.s/gi, 'représentés'],
    [/repr.sent.e/gi, 'représentée'],
    [/r.unis/gi, 'réunis'],
    [/r.uni/gi, 'réuni'],
    [/Visibilit. renforc.e/gi, 'Visibilité renforcée'],
    [/Plan m.dia/gi, 'Plan média'],
    [/pr.sence/gi, 'présence'],
    [/vid.os/gi, 'vidéos'],
    [/.changes cibl.s/gi, 'échanges ciblés'],
    [/organis.s/gi, 'organisés'],
    [/connect.e/gi, 'connectée'],
    [/fid.lisation/gi, 'fidélisation'],
    [/qualit./gi, 'qualité'],
    [/.dition anniversaire/gi, 'Édition anniversaire'],
    [/th.matiques/gi, 'thématiques'],
    [/repens.es/gi, 'repensées'],
    [/d.monstration/gi, 'démonstration'],
    [/ing.nieurs/gi, 'ingénieurs'],
    [/d.cideurs/gi, 'décideurs'],
    [/priv.s/gi, 'privés'],
    [/d.l.gations/gi, 'délégations'],
    [/Gros .uvre/gi, 'Gros œuvre'],
    [/D.coration/gi, 'Décoration'],
    [/Am.nagement/gi, 'Aménagement'],
    [/.quipements .lectriques/gi, 'Équipements électriques'],
    [/Mat.riels/gi, 'Matériels'],
    [/Num.riques/gi, 'Numériques'],
    [/b.timent/gi, 'bâtiment'],
    [/B.timent/gi, 'Bâtiment'],
    [/35 000 m[^²2\s]/g, '35 000 m² '],
    [/m\? d'/g, "m² d'"],
    [/m\? :/g, 'm² :'],
    [/m\?\./g, 'm².'],
    [/Minist.re/gi, 'Ministère'],
    [/Am.nagement/gi, 'Aménagement'],
    [/D.veloppement/gi, 'Développement'],
    [/F.d.ration/gi, 'Fédération'],
    [/Mat.riaux/gi, 'Matériaux'],
    [/d.l.gu./gi, 'délégué'],
    [/Entr.e/gi, 'Entrée'],
    [/T.l.chargez/gi, 'Téléchargez'],
    [/modalit.s/gi, 'modalités'],
    [/Pr.t /gi, 'Prêt '],
    [/R.servez/gi, 'Réservez'],
    [/b.n.ficiez/gi, 'bénéficiez'],
    [/20.me .dition/gi, '20ème édition'],
    [/c.t.s/gi, 'côtés'],
    [/Participez . l'/gi, "Participez à l'"],
    [/.dition/gi, 'édition'],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  // Point d'interrogation à la place d'un accent (PowerShell / Latin-1)
  if (result.includes('?')) {
    const qFixes: Array<[string, string]> = [
      ['repr?sent?s', 'représentés'],
      ['repr?sent?es', 'représentées'],
      ['r?unis', 'réunis'],
      ['Visibilit? renforc?e', 'Visibilité renforcée'],
      ['m?dia', 'média'],
      ['?changes', 'échanges'],
      ['organis?s', 'organisés'],
      ['connect?e', 'connectée'],
      ['fid?lisation', 'fidélisation'],
      ['qualit?', 'qualité'],
      ['?dition', 'édition'],
      ['th?matiques', 'thématiques'],
      ['d?monstration', 'démonstration'],
      ['b?timent', 'bâtiment'],
      ['35 000 m?', '35 000 m²'],
    ];
    for (const [from, to] of qFixes) {
      result = result.split(from).join(to);
    }
  }

  return result.replace(/\uFFFD/g, '');
}

export function fixFrenchEncodingRecord(record: Record<string, string>): Record<string, string> {
  const fixed: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== 'string') {
      fixed[key] = value;
      continue;
    }
    let next = fixFrenchEncoding(value);
    if (next.trim().startsWith('[') || next.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(next);
        const repaired = repairJsonFrench(parsed);
        next = JSON.stringify(repaired);
      } catch {
        /* keep string as-is */
      }
    }
    fixed[key] = next;
  }
  return fixed;
}

function repairJsonFrench(value: unknown): unknown {
  if (typeof value === 'string') return fixFrenchEncoding(value);
  if (Array.isArray(value)) return value.map(repairJsonFrench);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = repairJsonFrench(v);
    }
    return out;
  }
  return value;
}
