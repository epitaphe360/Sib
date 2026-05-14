import re, subprocess, sys

result = subprocess.run(
    ['git', '-C', r'c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib',
     'show', 'HEAD:src/store/translations.ts'],
    capture_output=True, text=True, encoding='utf-8'
)
lines = result.stdout.splitlines(keepends=True)

es_start = 0
ar_start = 0
for i, l in enumerate(lines):
    stripped = l.strip()
    if stripped == 'es: {':
        es_start = i
    if stripped == 'ar: {':
        ar_start = i

print(f'ar_start={ar_start+1}, es_start={es_start+1}, total={len(lines)}')

# Lignes tronquées dans HEAD ES
broken_head = []
for i in range(es_start, len(lines)):
    m = re.search(r"': '[^']*\\',", lines[i])
    if m:
        broken_head.append(i+1)

print(f'Lignes tronquées ES dans HEAD: {len(broken_head)}')
if broken_head[:5]:
    for ln in broken_head[:5]:
        print(f'  L{ln}: {lines[ln-1].rstrip()[:80]}')

# Sauvegarder la section ES du HEAD
with open('es_section_HEAD.txt', 'w', encoding='utf-8') as f:
    f.writelines(lines[es_start:])
print('Section ES HEAD sauvegardée dans es_section_HEAD.txt')
