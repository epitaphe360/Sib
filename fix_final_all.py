#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Applique les modifications finales: AdminNavVisibility + menu mobile."""

import re

# ─── 1. AdminDashboard.tsx : ajouter AdminNavVisibility ───────────────────────

FILE_ADMIN = 'src/components/dashboard/AdminDashboard.tsx'

with open(FILE_ADMIN, 'r', encoding='utf-8') as f:
    content = f.read()

# Ajouter l'import
OLD_IMPORT = '''import {
  AdminHeader,
  AdminActionsPanel,
  AdminMetricsGrid,
  AdminChartsSection,
  SystemHealthPanel,
  ActivityFeed,
} from './admin';'''

NEW_IMPORT = '''import {
  AdminHeader,
  AdminActionsPanel,
  AdminMetricsGrid,
  AdminChartsSection,
  SystemHealthPanel,
  ActivityFeed,
  AdminNavVisibility,
} from './admin';'''

if OLD_IMPORT in content:
    content = content.replace(OLD_IMPORT, NEW_IMPORT)
    print("OK: import AdminNavVisibility ajouté")
else:
    print("ERREUR: import non trouvé")

# Insérer le composant après la section CMS (après la motion.div divider ligne 152-162)
OLD_DIVIDER_AFTER_CMS = '''        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-8 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded bg-indigo-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent" />
        </motion.div>

        <AdminMetricsGrid adminMetrics={adminMetrics as any} t={t} />'''

NEW_DIVIDER_AFTER_CMS = '''        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-8 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded bg-indigo-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent" />
        </motion.div>

        <AdminNavVisibility />

        {/* Premium section divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-8 flex items-center gap-4 origin-left"
        >
          <div className="w-2 h-2 rounded bg-indigo-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent" />
        </motion.div>

        <AdminMetricsGrid adminMetrics={adminMetrics as any} t={t} />'''

if OLD_DIVIDER_AFTER_CMS in content:
    content = content.replace(OLD_DIVIDER_AFTER_CMS, NEW_DIVIDER_AFTER_CMS)
    print("OK: AdminNavVisibility inséré dans le dashboard")
else:
    print("ERREUR: section divider non trouvée")

with open(FILE_ADMIN, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"AdminDashboard.tsx écrit ({len(content)} chars)")


# ─── 2. Header.tsx : menu mobile ──────────────────────────────────────────────

FILE_HEADER = 'src/components/layout/Header.tsx'

with open(FILE_HEADER, 'r', encoding='utf-8') as f:
    content = f.read()

# Le Salon mobile
OLD_SALON_M = '''              {/* ══ Le Salon ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleSalonMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.le_salon')}
                  <span className={`transition-transform ${isSalonMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isSalonMenuOpen && salonMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>'''

NEW_SALON_M = '''              {/* ══ Le Salon ══ */}
              {navIsVisible('salon') && (
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleSalonMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.le_salon')}
                  <span className={`transition-transform ${isSalonMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isSalonMenuOpen && salonMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>
              )}'''

# Exposer mobile
OLD_EXPOSER_M = '''              {/* ══ Exposer ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleExposerMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.exposer')}
                  <span className={`transition-transform ${isExposerMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isExposerMenuOpen && exposerMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>'''

NEW_EXPOSER_M = '''              {/* ══ Exposer ══ */}
              {navIsVisible('exposer') && (
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleExposerMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.exposer')}
                  <span className={`transition-transform ${isExposerMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isExposerMenuOpen && exposerMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>
              )}'''

# Visiter mobile
OLD_VISITER_M = '''              {/* ══ Visiter ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleVisiterMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.visiter')}
                  <span className={`transition-transform ${isVisiterMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isVisiterMenuOpen && visiterMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>'''

NEW_VISITER_M = '''              {/* ══ Visiter ══ */}
              {navIsVisible('visiter') && (
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleVisiterMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.visiter')}
                  <span className={`transition-transform ${isVisiterMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isVisiterMenuOpen && visiterMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>
              )}'''

# Sponsors mobile
OLD_SPONSORS_M = '''              {/* ══ Sponsors ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleSponsorsMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.partners')}
                  <span className={`transition-transform ${isSponsorsMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isSponsorsMenuOpen && sponsorsMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>'''

NEW_SPONSORS_M = '''              {/* ══ Sponsors ══ */}
              {navIsVisible('sponsors') && (
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleSponsorsMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.partners')}
                  <span className={`transition-transform ${isSponsorsMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isSponsorsMenuOpen && sponsorsMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>
              )}'''

# Programme mobile
OLD_PROG_M = '''              {/* ══ Programme (lien direct) ══ */}
              <Link
                to={ROUTES.EVENTS}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.programme')}
              </Link>'''

NEW_PROG_M = '''              {/* ══ Programme (lien direct) ══ */}
              {navIsVisible('programme') && (
              <Link
                to={ROUTES.EVENTS}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.programme')}
              </Link>
              )}'''

# Réseautage mobile
OLD_NET_M = '''              {/* ══ Réseautage (lien direct) ══ */}
              <Link
                to={ROUTES.NETWORKING}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.networking')}
              </Link>'''

NEW_NET_M = '''              {/* ══ Réseautage (lien direct) ══ */}
              {navIsVisible('networking') && (
              <Link
                to={ROUTES.NETWORKING}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.networking')}
              </Link>
              )}'''

# Médias mobile
OLD_MEDIA_M = '''              {/* ══ Médias ══ */}
              {mediaVisible && mediaMenuItems.length > 0 && ('''

NEW_MEDIA_M = '''              {/* ══ Médias ══ */}
              {mediaVisible && navIsVisible('medias') && mediaMenuItems.length > 0 && ('''

# Contact mobile
OLD_CONTACT_M = '''              {/* ══ Contact ══ */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to={ROUTES.CONTACT}
                  className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={closeMenu}
                >
                  {t('nav.contact')}
                </Link>
              </div>'''

NEW_CONTACT_M = '''              {/* ══ Contact ══ */}
              {navIsVisible('contact') && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to={ROUTES.CONTACT}
                  className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={closeMenu}
                >
                  {t('nav.contact')}
                </Link>
              </div>
              )}'''

replacements = [
    ('Le Salon mobile',   OLD_SALON_M,    NEW_SALON_M),
    ('Exposer mobile',    OLD_EXPOSER_M,  NEW_EXPOSER_M),
    ('Visiter mobile',    OLD_VISITER_M,  NEW_VISITER_M),
    ('Sponsors mobile',   OLD_SPONSORS_M, NEW_SPONSORS_M),
    ('Programme mobile',  OLD_PROG_M,     NEW_PROG_M),
    ('Réseautage mobile', OLD_NET_M,      NEW_NET_M),
    ('Médias mobile',     OLD_MEDIA_M,    NEW_MEDIA_M),
    ('Contact mobile',    OLD_CONTACT_M,  NEW_CONTACT_M),
]

for name, old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"OK: {name}")
    else:
        print(f"ERREUR: {name} non trouvé")

# Vérification
total = len(re.findall(r'navIsVisible', content))
print(f"\nTotal navIsVisible dans Header.tsx: {total} (attendu: 16)")

with open(FILE_HEADER, 'w', encoding='utf-8') as f:
    f.write(content)
print("Header.tsx écrit avec succès!")
