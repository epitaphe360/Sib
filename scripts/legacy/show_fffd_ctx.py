import re

files = {
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/public/PresentationPage.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
}

for path in files:
    raw = open(path, 'rb').read()
    # Trouver toutes les séquences FFFD (ef bf bd)
    positions = [m.start() for m in re.finditer(b'\xef\xbf\xbd', raw)]
    print(f'\n{path}: {len(positions)}x U+FFFD')
    # Montrer le contexte ASCII autour de chaque FFFD
    for pos in positions:
        ctx_raw = raw[max(0,pos-25):pos+25]
        # Décoder en latin-1 pour voir les bytes bruts
        ctx = ctx_raw.decode('latin-1')
        print(f'  pos={pos}: {repr(ctx)}')
