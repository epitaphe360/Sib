import os, glob, re
base = r'C:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\src'
files = glob.glob(base + '/**/*.tsx', recursive=True) + glob.glob(base + '/**/*.ts', recursive=True)
issues = []
for f in files:
    try:
        content = open(f, encoding='utf-8', errors='ignore').read()
        todos = len(re.findall(r'// TODO|// FIXME|// HACK', content))
        tsignore = len(re.findall(r'@ts-ignore|@ts-nocheck', content))
        hardcoded = len(re.findall(r"password\s*[:=]\s*[\"']\w+[\"']", content, re.IGNORECASE))
        consolelog = len(re.findall(r'console\.log\(', content))
        if todos + tsignore + hardcoded + consolelog > 0:
            short = f.replace(base, 'src')
            issues.append((todos+tsignore+hardcoded+consolelog, short, todos, tsignore, hardcoded, consolelog))
    except:
        pass
issues.sort(reverse=True)
print('File|TODOs|ts-ign|hardcoded|logs')
for total, f, t, ts, h, l in issues[:25]:
    print(f'{f}|{t}|{ts}|{h}|{l}')
