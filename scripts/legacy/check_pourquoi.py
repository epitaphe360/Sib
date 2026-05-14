content = open('src/pages/public/PourquoiExposerPage.tsx', 'r', encoding='utf-8-sig').read()

# Afficher les 200 caractères autour des zones avec les mots clés du screenshot
for kw in ['repr', 'Visib', 'renfor', 'media', 'médi', 'ingén', 'décid']:
    idx = content.lower().find(kw.lower())
    if idx >= 0:
        ctx = content[max(0,idx-20):idx+80]
        print(f'{kw}: {repr(ctx)}')
