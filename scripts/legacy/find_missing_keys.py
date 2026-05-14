import os, re

trans_dir = 'src/i18n/translations'
defined = set()

for fname in os.listdir(trans_dir):
    if not fname.endswith('.ts') or fname == 'index.ts':
        continue
    content = open(f'{trans_dir}/{fname}', encoding='utf-8').read()
    matches = re.findall(r"'([a-zA-Z0-9_.]+)'\s*:\s*'", content)
    defined.update(matches)

print(f'Defined keys: {len(defined)}')

used = set()
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if 'i18n' not in d]
    for fname in files:
        if fname.endswith(('.tsx', '.ts')):
            try:
                c = open(os.path.join(root, fname), encoding='utf-8').read()
                keys = re.findall(r"t\('([a-zA-Z0-9_.]+)'\)", c)
                used.update(keys)
            except:
                pass

print(f'Used keys: {len(used)}')
missing = sorted(used - defined)
print(f'Missing: {len(missing)}')
for k in missing:
    print(k)
