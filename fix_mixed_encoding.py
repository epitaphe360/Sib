import os

def decode_mixed(raw: bytes) -> str:
    """Décode des bytes en encodage mixte : UTF-8 valide + cp1252 pour les bytes isolés."""
    result = []
    i = 0
    while i < len(raw):
        b = raw[i]
        if b < 0x80:
            result.append(chr(b))
            i += 1
        elif 0xc0 <= b < 0xe0 and i + 1 < len(raw) and 0x80 <= raw[i+1] < 0xc0:
            # 2-byte UTF-8
            try:
                result.append(raw[i:i+2].decode('utf-8'))
                i += 2
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        elif 0xe0 <= b < 0xf0 and i + 2 < len(raw) and 0x80 <= raw[i+1] < 0xc0 and 0x80 <= raw[i+2] < 0xc0:
            # 3-byte UTF-8
            try:
                result.append(raw[i:i+3].decode('utf-8'))
                i += 3
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        elif 0xf0 <= b < 0xf8 and i + 3 < len(raw) and all(0x80 <= raw[i+j] < 0xc0 for j in range(1, 4)):
            # 4-byte UTF-8
            try:
                result.append(raw[i:i+4].decode('utf-8'))
                i += 4
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        else:
            # Byte haut isolé → cp1252
            try:
                result.append(bytes([b]).decode('cp1252'))
            except (UnicodeDecodeError, ValueError):
                result.append('\ufffd')  # replacement character
            i += 1
    return ''.join(result)


problem_files = [
    'src/pages/partner/PartnerBankTransferPage.tsx',
    'src/pages/partner/PartnerPaymentSelectionPage.tsx',
    'src/pages/visitor/VisitorRegistrationChoice.tsx',
]

for path in problem_files:
    raw = open(path, 'rb').read()
    
    # Vérifier si déjà UTF-8 valide
    try:
        raw.decode('utf-8')
        print(f'SKIP (déjà UTF-8): {path}')
        continue
    except UnicodeDecodeError:
        pass
    
    text = decode_mixed(raw)
    open(path, 'w', encoding='utf-8').write(text)
    
    # Vérification
    raw2 = open(path, 'rb').read()
    try:
        raw2.decode('utf-8')
        print(f'OK: {path}')
    except UnicodeDecodeError as e:
        print(f'ERREUR après correction: {path}: {e}')
