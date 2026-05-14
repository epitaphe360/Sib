with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Exposer
content = content.replace(
    '            {/* Exposer ▼ */}\n            <div className="relative" onMouseEnter={() => setIsExposerMenuOpen(true)}',
    '            {/* Exposer ▼ */}\n            {navIsVisible(\'exposer\') && (\n            <div className="relative" onMouseEnter={() => setIsExposerMenuOpen(true)}'
)

# Fermer exposer + ouvrir Visiter
content = content.replace(
    '            </div>\n\n            {/* Visiter ▼ */}\n            <div className="relative" onMouseEnter={() => setIsVisiterMenuOpen(true)}',
    '            </div>\n            )}\n\n            {/* Visiter ▼ */}\n            {navIsVisible(\'visiter\') && (\n            <div className="relative" onMouseEnter={() => setIsVisiterMenuOpen(true)}'
)

# Fermer visiter + ouvrir Partenaires
content = content.replace(
    '            </div>\n\n            {/* Partenaires ▼ */}\n            <div className="relative" onMouseEnter={() => setIsPartenairesMenuOpen(true)}',
    '            </div>\n            )}\n\n            {/* Partenaires ▼ */}\n            {navIsVisible(\'sponsors\') && (\n            <div className="relative" onMouseEnter={() => setIsPartenairesMenuOpen(true)}'
)

# Fermer partenaires + divider
content = content.replace(
    '            </div>\n\n            {/* Divider */}',
    '            </div>\n            )}\n\n            {/* Divider */}'
)

# Envelopper Programme
content = content.replace(
    '            {/* Programme */}\n            <div className="relative" onMouseEnter={() => setIsProgrammeMenuOpen(true)}',
    '            {/* Programme */}\n            {navIsVisible(\'programme\') && (\n            <div className="relative" onMouseEnter={() => setIsProgrammeMenuOpen(true)}'
)

# Fermer programme + Reseautage
content = content.replace(
    '            </div>\n\n            {/* Réseautage (lien direct) */}',
    '            </div>\n            )}\n\n            {/* Réseautage (lien direct) */}'
)

# Envelopper Reseautage
content = content.replace(
    '            {/* Réseautage (lien direct) */}\n            <Link\n              to={ROUTES.NETWORKING}',
    '            {/* Réseautage (lien direct) */}\n            {navIsVisible(\'networking\') && (\n            <Link\n              to={ROUTES.NETWORKING}'
)

# Fermer Reseautage (avant Medias)
content = content.replace(
    '            </Link>\n\n            {/* Médias ▼',
    '            </Link>\n            )}\n\n            {/* Médias ▼'
)

with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Verification
hits = content.count("navIsVisible(")
print(f"navIsVisible() appearances: {hits} (expected 7)")
