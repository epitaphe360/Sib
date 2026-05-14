filepath = r'c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\src\store\translations.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Map of block marker -> text to insert after
inserts = {
    # FR block: insert common.save_error after 'common.saving'
    ("'common.saving': 'Enregistrement...',", "'common.save_error': 'Erreur lors de la sauvegarde : ',\n"),
}

# For all 4 blocks, find 'common.saving' lines and insert save_error after each one
# that doesn't already have save_error after it
targets = []
for i, line in enumerate(lines):
    if "'common.saving':" in line and 'Enregistrement' in line:
        snippet = ''.join(lines[i:i+3])
        if 'common.save_error' not in snippet:
            targets.append(i)
            print(f'Will insert after line {i+1}: {line.rstrip()}')

# Also check EN block
for i, line in enumerate(lines):
    if "'common.saving':" in line and 'Saving' in line:
        snippet = ''.join(lines[i:i+3])
        if 'common.save_error' not in snippet:
            targets.append(i)
            print(f'Will insert after line {i+1} (EN): {line.rstrip()}')

print(f'Targets: {targets}')

# Insert in reverse order
def get_insert_text(line_content):
    if 'Enregistrement' in line_content or 'Saving' not in line_content:
        return "    'common.save_error': 'Erreur lors de la sauvegarde : ',\n"
    else:
        return "    'common.save_error': 'Save error: ',\n"

for idx in sorted(targets, reverse=True):
    text = get_insert_text(lines[idx])
    lines.insert(idx + 1, text)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'Done. Added common.save_error in {len(targets)} blocks.')
