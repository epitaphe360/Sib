import re

path = r"src/pages/admin/AdminBadgeConfigPage.tsx"
with open(path, encoding="utf-8") as f:
    content = f.read()

# Trouver le début du code orphelin dans Face4Preview
# Il commence par "  return (\n    <>\n      <div style={{ background: config.header_bg"
# juste après la nouvelle fonction Face4Preview
orphan_pattern = r"\n  return \(\n    <>\n      <div style=\{\{ background: config\.header_bg, padding: '8px 12px'"
match = re.search(orphan_pattern, content)
if not match:
    print("Orphan start not found!")
    exit(1)

# La fin du code orphelin : juste avant "async function loadBadgeConfig"
end_marker = "\nasync function loadBadgeConfig("
idx_end = content.find(end_marker)
if idx_end == -1:
    print("End marker not found!")
    exit(1)

# L'orphelin se termine par "}\n" juste avant async function
# On doit trouver le "}" qui clôt la 2ème fonction Face4Preview
tail = content[match.start():idx_end]
print(f"Orphan starts at char {match.start()}, length: {len(tail)}")
print("=== Preview start ===")
print(repr(tail[:200]))
print("=== Preview end ===")
print(repr(tail[-200:]))

# Supprimer l'orphelin
new_content = content[:match.start()] + "\n\n" + content[idx_end:]

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done! Orphan removed from AdminBadgeConfigPage.")
