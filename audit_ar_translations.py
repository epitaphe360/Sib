"""
Analyse les clés du bloc AR qui n'ont pas de texte arabe réel
"""
import re, unicodedata

content = open('src/store/translations.ts', encoding='utf-8').read()

# Trouver le bloc ar (entre ar: { et es: {)
ar_match = re.search(r'\n  ar:\s*\{(.+?)\n  \},?\s*\n\s*es:', content, re.DOTALL)
if not ar_match:
    print("Bloc AR non trouvé")
    exit()

ar_block = ar_match.group(1)
keys = re.findall(r"'([^']+)'\s*:\s*'([^']*)'", ar_block)
total = len(keys)

def has_arabic(s):
    return any('\u0600' <= c <= '\u06ff' for c in s)

# Clés sans texte arabe (vides ou en latin)
non_arabic = [(k, v) for k, v in keys if not has_arabic(v)]
good = total - len(non_arabic)

print(f"Total clés AR: {total}")
print(f"Avec texte arabe: {good} ({100*good//total}%)")
print(f"Sans texte arabe: {len(non_arabic)} ({100*len(non_arabic)//total}%)")
print()

# Sauvegarder la liste des clés à corriger
with open('ar_keys_to_fix.txt', 'w', encoding='utf-8') as f:
    for k, v in non_arabic:
        f.write(f"{k}|{v}\n")

print(f"Liste sauvegardée: ar_keys_to_fix.txt")
print("\nExemples:")
for k, v in non_arabic[:30]:
    print(f"  {k}: '{v}'")
