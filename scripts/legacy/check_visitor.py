"""Check remaining French strings in VisitorProfileSettings."""
import re

with open('src/components/visitor/VisitorProfileSettings.tsx', 'rb') as f:
    content = f.read()

lines = content.decode('utf-8', errors='replace').split('\n')
found = []
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if stripped.startswith('//') or stripped.startswith('*') or not stripped:
        continue
    # Check for French accented chars in string literals, not already translated
    if re.search(r'[\u00c0-\u00ff]', line):
        if "t('" not in line and 'getCms' not in line and 'aria-label' not in line:
            found.append(f'Line {i}: {stripped[:120]}')

print(f'Found {len(found)} lines with remaining French text:')
for f in found[:20]:
    print(f)
