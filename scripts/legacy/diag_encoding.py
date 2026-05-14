path = 'src/pages/exhibitor/ExhibitorScansPage.tsx'
raw = open(path, 'rb').read()

# Trouver toutes les séquences non-ASCII
import re
for m in re.finditer(rb'[^\x00-\x7f]+', raw):
    start = m.start()
    context_start = max(0, start - 40)
    context_end = min(len(raw), m.end() + 40)
    ctx = raw[context_start:context_end]
    print(f'Pos {start}: bytes={m.group().hex()} | ctx={repr(ctx.decode("latin-1"))}')
