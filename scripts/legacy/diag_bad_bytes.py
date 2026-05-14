problem_files = [
    ('src/pages/partner/PartnerBankTransferPage.tsx', 25095),
    ('src/pages/partner/PartnerPaymentSelectionPage.tsx', 4883),
    ('src/pages/visitor/VisitorRegistrationChoice.tsx', 11729),
]

for path, bad_pos in problem_files:
    raw = open(path, 'rb').read()
    ctx_start = max(0, bad_pos - 60)
    ctx_end = min(len(raw), bad_pos + 60)
    ctx = raw[ctx_start:ctx_end]
    byte_val = raw[bad_pos]
    print(f'{path}')
    print(f'  pos={bad_pos} byte=0x{byte_val:02x}')
    print(f'  ctx bytes: {ctx.hex()}')
    # Afficher en latin-1
    print(f'  ctx latin-1: {repr(ctx.decode("latin-1"))}')
    # Vérifier si c'est un byte UTF-8 qui serait double-encodé
    print()
