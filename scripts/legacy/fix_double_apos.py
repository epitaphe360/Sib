"""Find and fix all \\'' patterns in translations.ts"""

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
problems = []
for i, line in enumerate(lines, 1):
    if "\\\\'" in line or "\\'" + "'" in line:
        problems.append((i, line.strip()[:120]))

print(f"Lines with \\\\' or \\'' : {len(problems)}")
for lineno, line in problems:
    print(f"  L{lineno}: {line}")

# Count specific pattern
pat = "\\'" + "'"
count = content.count(pat)
print(f"\nTotal '\\'' occurrences: {count}")

# Fix: replace \\'' with \\'
if count > 0:
    fixed = content.replace(pat, "\\'")
    with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f"Fixed {count} occurrences.")
else:
    print("Nothing to fix.")
