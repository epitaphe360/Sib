#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corrige le bloc nav desktop dans Header.tsx directement sur disque."""

import re

FILE = 'src/components/layout/Header.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# --- Identifier les lignes marqueurs pour trouver le bloc nav ---
# Le bloc nav va de '<nav className="hidden lg:flex' jusqu'à '</nav>'
# On va remplacer tout le contenu entre ces balises

NAV_START = '          {/* Desktop Navigation */}\n          <nav className="hidden lg:flex items-center gap-0 xl:gap-0.5 flex-1 justify-center">'
NAV_END   = '          </nav>'

idx_start = content.find(NAV_START)
idx_end   = content.find(NAV_END, idx_start)

if idx_start == -1:
    print("ERREUR: Balise de début non trouvée")
    exit(1)
if idx_end == -1:
    print("ERREUR: Balise de fin non trouvée")
    exit(1)

print(f"Nav section: lignes autour de pos {idx_start}–{idx_end+len(NAV_END)}")

# Nouveau bloc nav correct
NEW_NAV = '''          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0 xl:gap-0.5 flex-1 justify-center">

            {/* Le Salon ▼ */}
            {navIsVisible('salon') && (
            <div className="relative" onMouseEnter={() => setIsSalonMenuOpen(true)} onMouseLeave={() => setIsSalonMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.le_salon')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isSalonMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {salonMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Exposer ▼ */}
            {navIsVisible('exposer') && (
            <div className="relative" onMouseEnter={() => setIsExposerMenuOpen(true)} onMouseLeave={() => setIsExposerMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.exposer')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isExposerMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {exposerMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Visiter ▼ */}
            {navIsVisible('visiter') && (
            <div className="relative" onMouseEnter={() => setIsVisiterMenuOpen(true)} onMouseLeave={() => setIsVisiterMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.visiter')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isVisiterMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {visiterMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Sponsors ▼ */}
            {navIsVisible('sponsors') && (
            <div className="relative" onMouseEnter={() => setIsSponsorsMenuOpen(true)} onMouseLeave={() => setIsSponsorsMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.partners')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isSponsorsMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {sponsorsMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Divider */}
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5 xl:mx-1" />

            {/* Programme ▼ */}
            {navIsVisible('programme') && (
            <div className="relative" onMouseEnter={() => setIsProgrammeMenuOpen(true)} onMouseLeave={() => setIsProgrammeMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.programme')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isProgrammeMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  <Link to={ROUTES.EVENTS} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-900">{t('nav.programme')}</div>
                      <div className="text-xs text-slate-500">{t('nav.programme_desc')}</div>
                    </div>
                  </Link>
                  <Link to={ROUTES.SPEAKERS} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-900">{t('visiter.speakers')}</div>
                      <div className="text-xs text-slate-500">{t('visiter.speakers_desc')}</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            )}

            {/* Réseautage (lien direct) */}
            {navIsVisible('networking') && (
            <Link
              to={ROUTES.NETWORKING}
              className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 group whitespace-nowrap"
            >
              {t('nav.networking')}
              <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            )}

            {/* Médias ▼ (conditionnel) */}
            {mediaVisible && navIsVisible('medias') && (
            <div className="relative" onMouseEnter={() => setIsMediaMenuOpen(true)} onMouseLeave={() => setIsMediaMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap">
                <Video className="w-3 h-3 xl:w-3.5 xl:h-3.5" style={{ color: '#C9A84C' }} />
                <span>{t('media.menu_title')}</span>
                <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              {isMediaMenuOpen && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {mediaMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors group">
                        <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-slate-300 group-hover:text-[#C9A84C] transition-colors" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Contact */}
            {navIsVisible('contact') && (
            <Link
              to="/contact"
              className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-medium uppercase tracking-[0.1em] text-slate-500 hover:text-[#C9A84C] transition-all duration-300 flex items-center gap-1 group whitespace-nowrap"
            >
              <span>{t('nav.contact')}</span>
              <span className="absolute bottom-0 left-2 right-2 h-[0.5px] bg-[#E7D192] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            )}
          </nav>'''

# Remplacer le bloc entier
old_block = content[idx_start : idx_end + len(NAV_END)]
new_content = content[:idx_start] + NEW_NAV + content[idx_end + len(NAV_END):]

# Vérification
import re
count = len(re.findall(r'navIsVisible', new_content))
print(f"navIsVisible dans le nouveau fichier: {count} (attendu: 8)")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fichier écrit avec succès!")

# Vérification finale
with open(FILE, 'r', encoding='utf-8') as f:
    verify = f.read()
count2 = len(re.findall(r'navIsVisible', verify))
print(f"Vérification après écriture: {count2} occurrences navIsVisible")
