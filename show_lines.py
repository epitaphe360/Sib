import sys, re

files = [
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/public/PresentationPage.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
    'scripts/createMissingTables.ts',
]

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    print(f'\n=== {path} ===')
    for i, line in enumerate(content.split('\n'), 1):
        if '\ufffd' in line:
            safe = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f'{i}: {safe}')
