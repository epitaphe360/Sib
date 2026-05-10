import re, subprocess

# Lire la section ES du HEAD depuis git
result = subprocess.run(
    ['git', '-C', r'c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib',
     'show', 'HEAD:src/store/translations.ts'],
    capture_output=True, text=True, encoding='utf-8'
)
head_lines = result.stdout.splitlines(keepends=True)

# Trouver la section ES dans HEAD
es_start_head = 0
for i, l in enumerate(head_lines):
    if l.strip() == 'es: {':
        es_start_head = i
        break

# Construire un dict key -> full_line depuis HEAD ES
head_es = {}
for line in head_lines[es_start_head:]:
    m = re.match(r"\s*'([^']+)':\s*(.+)", line)
    if m:
        head_es[m.group(1)] = line

print(f'Clés dans ES HEAD: {len(head_es)}')

# Lire le fichier actuel
with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    current_lines = f.readlines()

# Trouver la section ES dans le fichier actuel (ligne 12598 = index 12597)
es_start_current = 12597

fixed = 0
not_found = []

for i in range(es_start_current, len(current_lines)):
    line = current_lines[i]
    # Ligne tronquée: se termine par \',
    if re.search(r"': '[^']*\\',", line):
        # Extraire la clé
        km = re.match(r"\s*'([^']+)':", line)
        if km:
            key = km.group(1)
            if key in head_es:
                current_lines[i] = head_es[key]
                fixed += 1
            else:
                not_found.append((i+1, line.rstrip()))

print(f'\nLignes restaurées depuis HEAD: {fixed}')
print(f'Lignes non trouvées dans HEAD: {len(not_found)}')
for ln, content in not_found:
    print(f'  L{ln}: {content[:80]}')

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.writelines(current_lines)
print('\nFichier sauvegardé')
