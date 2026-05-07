import re

REPL = '\ufffd'

# --- Diagnostic exact des patterns manqués ---
for path in [
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
    'scripts/createMissingTables.ts',
    'src/pages/public/PresentationPage.tsx',
]:
    content = open(path, 'r', encoding='utf-8').read()
    count = content.count(REPL)
    if count == 0:
        continue
    print(f'\n=== {path} ({count}) ===')
    for i, line in enumerate(content.split('\n'), 1):
        if REPL in line:
            safe = line.strip()
            print(f'  L{i}: {repr(safe)}')
