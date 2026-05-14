import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

valid_escapes = set('nrts\\\'"0abfvuUx \r\n')
errors = []
for i, line in enumerate(lines, 1):
    # Find \X where X is not a valid escape char
    for m in re.finditer(r'\\([a-zA-Z])', line):
        char = m.group(1)
        if char not in valid_escapes:
            errors.append((i, line.rstrip()[:150], m.start(), char))

if not errors:
    print("Aucune erreur trouvee")
else:
    for lineno, line, pos, char in errors:
        print(f"Line {lineno}: invalid \\{char} at col {pos}")
        print(f"  {line}")
        print()
