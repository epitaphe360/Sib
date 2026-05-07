import re

problem_files = [
    'src/pages/partner/PartnerBankTransferPage.tsx',
    'src/pages/partner/PartnerPaymentSelectionPage.tsx',
    'src/pages/visitor/VisitorRegistrationChoice.tsx',
]

for path in problem_files:
    raw = open(path, 'rb').read()
    
    # Afficher les bytes problématiques
    bad = [(m.start(), m.group().hex()) for m in re.finditer(rb'[^\x00-\x7f]', raw)]
    print(f'\n{path}: {len(bad)} bytes non-ASCII')
    
    # Afficher les contextes uniques
    shown = set()
    for pos, h in bad[:5]:
        ctx_start = max(0, pos - 30)
        ctx = raw[ctx_start:pos+30]
        byte_val = raw[pos]
        if byte_val not in shown:
            shown.add(byte_val)
            print(f'  byte=0x{h} pos={pos} ctx={repr(ctx.decode("latin-1"))}')
