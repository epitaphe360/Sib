lines = open('src/store/translations.ts', encoding='utf-8').readlines()

inserts = [
    (37,   ["    'secteurs.title_1': 'Secteurs',\n", "    'secteurs.title_2': \"d'activités\",\n"]),
    (2842, ["    'secteurs.title_1': 'Activity',\n", "    'secteurs.title_2': 'Sectors',\n"]),
    (5630, ["    'secteurs.title_1': 'Sectores',\n", "    'secteurs.title_2': 'de Actividad',\n"]),
    (8425, ["    'secteurs.title_1': 'قطاعات',\n", "    'secteurs.title_2': 'النشاط',\n"]),
]

result = list(lines)
offset = 0
for base_line, new_lines in inserts:
    idx = base_line - 1 + offset
    for j, nl in enumerate(new_lines):
        result.insert(idx + 1 + j, nl)
    offset += len(new_lines)

open('src/store/translations.ts', 'w', encoding='utf-8').writelines(result)
print('Done. secteurs.title_1 and secteurs.title_2 added to all 4 language blocks.')
