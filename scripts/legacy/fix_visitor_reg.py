"""
Corrige les objets orphelins dans RegisterPage.tsx et VisitorFreeRegistration.tsx.
"""

def normalize(content):
    return content.replace('\r\r\n', '\n').replace('\r\n', '\n')

def fix_file_by_context(filepath, context_search, old_fragment, new_fragment):
    """Corrige un fragment dans un fichier (avec fins de ligne normalisées)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = normalize(content)
    
    # Chercher le context
    idx = normalized.find(context_search)
    if idx < 0:
        # Essayer avec lignes vides (double \n)
        context_double = '\n\n'.join(context_search.split('\n'))
        idx = normalized.find(context_double)
        if idx < 0:
            print(f'MANQUE contexte dans {filepath}')
            return False
    
    # Chercher old_fragment avec doubles sauts de ligne
    old_double = '\n\n'.join(old_fragment.split('\n'))
    if old_double in normalized:
        updated = normalized.replace(old_double, new_fragment, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        print(f'OK (double nl): {filepath}')
        return True
    
    # Essayer sans les doubles sauts
    if old_fragment in normalized:
        updated = normalized.replace(old_fragment, new_fragment, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        print(f'OK: {filepath}')
        return True
    
    print(f'MANQUE fragment dans {filepath}')
    # Debug: show context
    idx2 = normalized.find('onClick={(e) => {')
    while idx2 >= 0:
        ctx = normalized[idx2:idx2+300]
        if 'errorsCount' in ctx:
            print(f'Contexte trouvé:\n{repr(ctx[:250])}')
            break
        idx2 = normalized.find('onClick={(e) => {', idx2+1)
    return False

# Fix 1: VisitorFreeRegistration.tsx - onClick avec objet orphelin
# Lignes 1092-1105 montrent: onClick={(e) => { \n\n\n isSubmitting, ...
fix_file_by_context(
    'src/pages/visitor/VisitorFreeRegistration.tsx',
    'onClick={(e) => {',
    'onClick={(e) => {\n\n\n                    isSubmitting,\n\n                    isValid,\n\n                    isDirty,\n\n                    errorsCount: Object.keys(errors).length,\n\n                    formData: watch()\n\n                  });',
    'onClick={(e) => {\n                  console.log(\'Debug:\', {\n                    isSubmitting,\n                    isValid,\n                    isDirty,\n                    errorsCount: Object.keys(errors).length,\n                    formData: watch()\n                  });'
)
