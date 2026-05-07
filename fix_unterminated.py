"""
Fix all syntax errors in translations.ts by validating TypeScript string literals.
Scans for:
1. \'' (double apostrophe) -> \'
2. Unterminated single-quoted strings (ending with \' instead of closing ')
"""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixes = []

for i, line in enumerate(lines):
    lineno = i + 1
    stripped = line.rstrip('\n\r')
    
    # Check for lines that have a value starting with ' and ending with \',
    # Pattern: key: 'content\',  <- the \' escapes the quote, leaving string open
    # This matches: '...\', at end of line (string never closed)
    # We look for lines where the value ends with \'  followed by comma
    m = re.search(r": '(.*?)\\',\s*$", stripped)
    if m:
        val = m.group(1)
        # Count unescaped apostrophes - if odd number of \' in val, string is open
        # Simple heuristic: if line ends with \', the last ' is escaped, not closing
        # Fix: add another ' to close the string
        old = stripped
        new = stripped[:-len("',")].rstrip() + "'\\''"  + ","  
        # Actually simpler: replace trailing \', with \'',
        new = re.sub(r"\\',(\s*)$", r"\\''," + r"\1", stripped)
        if new != stripped:
            fixes.append((i, stripped, new + '\n'))
            print(f"L{lineno}: {stripped.strip()[:80]}")
            print(f"  -> {new.strip()[:80]}")
            print()

    # Check for \'' (double apostrophe)
    if "\\'" + "'" in stripped:
        old = stripped
        new = stripped.replace("\\'" + "'", "\\'")
        if new != old:
            # Only fix if not already handled above
            already = any(f[0] == i for f in fixes)
            if not already:
                fixes.append((i, stripped, new + '\n'))
                print(f"L{lineno} (double apos): {stripped.strip()[:80]}")

print(f"\nTotal fixes: {len(fixes)}")

if fixes:
    for idx, old, new_line in fixes:
        lines[idx] = new_line
    
    with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File saved.")
