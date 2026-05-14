import re

REPL = '\ufffd'

files = [
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/public/PresentationPage.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
    'scripts/createMissingTables.ts',
]

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    count = content.count(REPL)
    print(f'\n=== {path} ({count} occurrences) ===')
    for m in re.finditer(r'.{0,50}' + re.escape(REPL) + r'.{0,50}', content):
        print(f'  {repr(m.group())}')
