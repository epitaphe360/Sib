with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '            {/* Programme (lien direct) */}\n            <Link\n              to={ROUTES.EVENTS}\n              className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 group whitespace-nowrap"\n            >\n              {t(\'nav.programme\')}\n              <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />\n            </Link>'

new = '            {/* Programme */}\n            <div className="relative" onMouseEnter={() => setIsProgrammeMenuOpen(true)} onMouseLeave={() => setIsProgrammeMenuOpen(false)}>\n              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">\n                <span>{t(\'nav.programme\')}</span>\n                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />\n              </button>\n              {isProgrammeMenuOpen && (\n                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">\n                  <Link to={ROUTES.EVENTS} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">\n                    <div>\n                      <div className="font-semibold text-slate-900">{t(\'nav.programme\')}</div>\n                      <div className="text-xs text-slate-500">{t(\'nav.programme_desc\')}</div>\n                    </div>\n                  </Link>\n                  <Link to={ROUTES.SPEAKERS} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">\n                    <div>\n                      <div className="font-semibold text-slate-900">{t(\'visiter.speakers\')}</div>\n                      <div className="text-xs text-slate-500">{t(\'visiter.speakers_desc\')}</div>\n                    </div>\n                  </Link>\n                </div>\n              )}\n            </div>'

if old in content:
    content = content.replace(old, new)
    
    # Supprimer aussi le doublon existant (Programme triangledown) si present
    doublon_marker = '{/* Programme \u25bc */}'
    if doublon_marker in content:
        # Trouver et supprimer tout le bloc doublon
        idx_d = content.find(doublon_marker)
        # Le doublon commence par \n\n avant le commentaire
        start_d = content.rfind('\n\n', 0, idx_d)
        # Trouver la fin du bloc </div>
        end_d = content.find('            </div>', idx_d)
        if end_d != -1:
            end_d = end_d + len('            </div>')
            content = content[:start_d] + content[end_d:]
            print('Doublon supprime')
    
    with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS - Programme est maintenant un dropdown avec Intervenants')
else:
    print('FAILED - texte introuvable')
