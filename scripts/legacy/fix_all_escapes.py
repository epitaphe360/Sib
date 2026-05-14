"""Comprehensive fix for all syntax errors in translations.ts.
Fixes:
1. \'' (double apostrophe escape) -> \'
2. Any remaining invalid \X escapes -> \'X
"""
import re

with open('src/store/translations.ts', 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8')
original = content

# Fix 1: Replace \'' with \' (double apostrophe -> single)
count1 = content.count("\\''" )
content = content.replace("\\''", "\\'")
print(f"Fix \\'' -> \\' : {count1} replacements")

# Fix 2: Find remaining invalid \X escapes (X = letter not in valid set)
# Valid: n r t s 0 a b f v u U x ' " \
valid = set("nrts0abfvuUx'\"\\")
lines = content.split('\n')
new_lines = []
fix2_count = 0
for i, line in enumerate(lines, 1):
    new_line = line
    # Find \X where X is a letter not in valid set
    matches = list(re.finditer(r'\\([a-zA-Z])', new_line))
    # Process in reverse to not mess up indices
    for m in reversed(matches):
        c = m.group(1)
        if c not in valid:
            # Replace \X with \'X (it was meant to be an apostrophe + letter)
            pos = m.start()
            new_line = new_line[:pos] + "\\'" + new_line[pos+1:]
            fix2_count += 1
            print(f"  L{i}: \\{c} -> \\'{c}  | {line.strip()[:80]}")
    new_lines.append(new_line)

content = '\n'.join(new_lines)
print(f"\nFix invalid escapes: {fix2_count} replacements")

if content != original:
    with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("\nFile saved.")
else:
    print("\nNo changes needed.")
