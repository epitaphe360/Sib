import re
import os
import glob

files = glob.glob('src/i18n/translations/*.ts')
files = [f for f in files if not f.endswith('index.ts')]

total_fr = 0
total_en = 0
results = []

for f in sorted(files):
    content = open(f, encoding='utf-8').read()

    # Trouver le bloc fr: { ... } (jusqu'au prochain bloc de même niveau)
    fr_match = re.search(r'  fr\s*:\s*\{(.*?)\n  \}', content, re.DOTALL)
    en_match = re.search(r'  en\s*:\s*\{(.*?)\n  \}', content, re.DOTALL)

    # Compter les entrées de type 'clé': '...' ou 'clé': `...`
    key_pattern = r"'[^']+'\s*:\s*['\"`]"
    fr_keys = len(re.findall(key_pattern, fr_match.group(1))) if fr_match else 0
    en_keys = len(re.findall(key_pattern, en_match.group(1))) if en_match else 0

    name = os.path.basename(f)
    results.append((name, fr_keys, en_keys))
    total_fr += fr_keys
    total_en += en_keys

print(f"{'Fichier':<25} {'FR':>5} {'EN':>5} {'%':>7}")
print('-' * 46)
for name, fr, en in results:
    pct = round(en / fr * 100, 1) if fr > 0 else 0.0
    bar = '#' * int(pct / 10)
    print(f"{name:<25} {fr:>5} {en:>5} {pct:>6}%  [{bar:<10}]")

print('-' * 46)
pct_total = round(total_en / total_fr * 100, 1) if total_fr > 0 else 0.0
print(f"{'TOTAL':<25} {total_fr:>5} {total_en:>5} {pct_total:>6}%")
