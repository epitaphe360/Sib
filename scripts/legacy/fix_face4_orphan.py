import re

path = r"src/components/badge/PrintableBadgeA4.tsx"
with open(path, encoding="utf-8") as f:
    content = f.read()

# Le nouveau Face4 se termine par son propre return+}
# Ensuite vient le code orphelin jusqu'à interface PrintableBadgeA4Props
# On cherche le marqueur de fin du code orphelin
marker_end = "interface PrintableBadgeA4Props {"

# On cherche la fin de la nouvelle fonction Face4 (son })
# juste avant le code orphelin (qui contient hasSponsors et partners_cols)
# Le code orphelin commence par un <div avec "background: primary, padding: '3mm 4mm'"
# suivi de {hasSponsors

orphan_start_pattern = r"\n      <div style=\{\{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' \}\}>\n        \{config\.logo_main_url"

match = re.search(orphan_start_pattern, content)
if not match:
    print("Orphan start not found!")
    exit(1)

print(f"Orphan starts at char {match.start()}")

# Trouver la fin du code orphelin (juste avant "interface PrintableBadgeA4Props")
idx_end = content.find("interface PrintableBadgeA4Props")
if idx_end == -1:
    print("End marker not found!")
    exit(1)

# On remonte pour trouver la séquence "}\n\n" ou "}\n" juste avant l'interface
# L'orphelin se termine par:  );\n}\n\n ou );\n}\n
# Chercher "  );\n}\n" juste avant l'interface
tail = content[match.start():idx_end]
print(f"Orphan length: {len(tail)} chars")
print("=== Orphan preview (first 200 chars) ===")
print(repr(tail[:200]))
print("=== Orphan preview (last 200 chars) ===")
print(repr(tail[-200:]))

# Supprimer le code orphelin
new_content = content[:match.start()] + "\n\n" + content[idx_end:]
with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done! Orphan removed.")
print(f"File length: {len(new_content)} chars (was {len(content)})")
