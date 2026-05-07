import re

files = [
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/public/PresentationPage.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
]

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    fffd_count = content.count('\ufffd')
    print(f'\n=== {path} ({fffd_count}x U+FFFD) ===')
    for m in re.finditer(r'.{0,40}\ufffd.{0,40}', content):
        print(f'  {repr(m.group())}')
