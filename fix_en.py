import re

content = open('src/store/translations.ts', encoding='utf-8').read()

en_start = re.search(r'\n  en:\s*\{', content)
ar_start = re.search(r'\n  ar:\s*\{', content)
en_block_start = en_start.end()
en_block_end = ar_start.start()
en_block = content[en_block_start:en_block_end]

# Remplacements explicites clé → valeur EN correcte
EN_FIXES = {
    'categories.bâtiment-operations': 'Building Operations',
    'article.sibs_2026': 'SIB 2026: The International Building and Construction Exhibition',
    'article.sibs_excerpt': 'Discover the largest building industry event in North Africa planned for 2026. A unique opportunity to meet, innovate and build partnerships.',
    'article.sibs_content': 'SIB 2026 is the essential meeting point for professionals in the building and construction sector. This major event will bring together key players from across the industry.',
    'article.innovation_title': 'Building Innovation: Technologies Transforming Our Constructions',
    'article.innovation_excerpt': 'Artificial intelligence, automation, IoT: modern buildings adopt cutting-edge technologies to improve their efficiency and sustainability.',
    'article.innovation_content': 'Buildings around the world are heavily investing in new technologies. From smart systems to automation and energy management, the sector is transforming rapidly.',
    'article.durability_title': 'Sustainable Development: Buildings Commit to the Environment',
    'article.durability_excerpt': 'Ecological initiatives are multiplying in the construction sector to reduce the carbon footprint of buildings.',
    'article.durability_content': 'Facing climate challenges, buildings are adopting ambitious strategies to reduce their environmental impact. Renewable energies, electrification, waste management.',
    'article.mediterranean_title': 'Building Trade in the Mediterranean: 2026 Perspectives',
    'article.mediterranean_excerpt': 'Analysis of trends in Mediterranean construction trade and opportunities for sector players.',
    'article.mediterranean_content': 'The Mediterranean remains a strategic hub for world trade. With the rise of smart buildings and sustainable construction, new opportunities are emerging.',
    'article.careers_title': 'Training and Employment: Building Jobs of Tomorrow',
    'article.careers_excerpt': 'The construction sector is hiring! Discover training programs and career opportunities at SIB 2026.',
    'article.careers_content': 'The building sector is undergoing major changes and seeking new talent. From traditional trades to digital roles, opportunities are everywhere.',
    'article.security_title': 'Building Security: New International Standards',
    'article.security_content': 'Safety remains a top priority in building facilities. Cybersecurity, access control, fire safety: the new standards at SIB 2026.',
    'visitor.sector.authority': 'Building Authority',
    'visitor.sector.transport': 'Building Transport',
    'hero.subtitle': 'The International Building Exhibition - Connect, Innovate, Transform',
    'partnership.description': 'Join the international building and construction ecosystem',
    'sub.whySection.subtitle': 'An immersive experience at the heart of the international building ecosystem',
    'sub.whySection.worldEventDesc': 'The largest building exhibition in Africa and the Arab world',
    'sub.why1': 'Explore the latest innovations in smart buildings, construction connectivity, sustainable infrastructure and logistics automation.',
    'sub.why4': 'Discover training programs, future careers and talent in the building sector.',
    'sub.why5': 'Enjoy a unique artistic immersion in the Building Museum and the Artistic space dedicated to architecture.',
    'sub.pav5.title': 'Building Museum',
    'sub.info.contactAddr': '63, Imm B, Res LE YACHT, Bd de la Corniche 7th floor N185, Casablanca 20510',
    'admin_media.create_title_example': 'Ex: Building Innovation Interview',
    'about.excellence': 'Building Excellence',
    'pages.events.strategic_reflection': 'A strategic reflection space bringing together institutional decision-makers and major industry players for high-level discussions.',
    'about.excellence_desc': 'High standards and exceptional quality in the building sector',
}

fixed = 0
for key, en_value in EN_FIXES.items():
    pattern = r"('" + re.escape(key) + r"'\s*:\s*')([^']*?)(')"
    replacement = r'\g<1>' + en_value.replace('\\', '\\\\') + r'\3'
    new_en_block, count = re.subn(pattern, replacement, en_block)
    if count > 0:
        en_block = new_en_block
        fixed += count
    else:
        print(f'  NON TROUVÉE: {key}')

content = content[:en_block_start] + en_block + content[en_block_end:]
open('src/store/translations.ts', 'w', encoding='utf-8').write(content)
print(f'Clés EN corrigées: {fixed}')

# Vérification finale
content2 = open('src/store/translations.ts', encoding='utf-8').read()
en_m = re.search(r'\n  en:\s*\{', content2)
ar_m = re.search(r'\n  ar:\s*\{', content2)
en_b = content2[en_m.end():ar_m.start()]
keys2 = re.findall(r"'([^']+)'\s*:\s*'([^']*?)'", en_b)
total2 = len(keys2)
french_chars = set('àâäéèêëîïôöùûüçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ')
bad2 = [(k, v) for k, v in keys2 if any(c in french_chars for c in v)]
print(f'Résultat EN: {total2 - len(bad2)}/{total2} correctes ({100*(total2-len(bad2))//total2}%) — restent françaises: {len(bad2)}')
