"""
Corrige les erreurs de syntaxe dans RegisterPage.tsx (CRCRLF encoding).
"""

def fix_file(filepath, old, new):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    lines = normalized.split('\n')
    
    # Afficher les lignes pour debug
    for i in range(1318, min(1342, len(lines)+1)):
        try:
            print(f'{i}: {repr(lines[i-1])}')
        except:
            print(f'{i}: (encoding error)')
    
    if old in normalized:
        updated = normalized.replace(old, new, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        print('OK!')
        return True
    else:
        print('Pattern non trouvé')
        # Chercher une variation
        idx = normalized.find('onClick={() => {')
        while idx >= 0:
            ctx = normalized[idx:idx+300]
            if 'isSubmitting' in ctx and 'errorsCount' in ctx:
                print('Contexte trouvé:')
                print(repr(ctx[:250]))
                break
            idx = normalized.find('onClick={() => {', idx+1)
        return False

# Le vrai pattern avec les lignes vides (double \n) du CRCRLF
old = 'onClick={() => {\n                          isSubmitting,\n                          currentStep,\n                          errorsCount: Object.keys(errors).length,\n                          errors,\n                          formData: watch()\n                        });'
new = 'onClick={() => {\n                        console.log(\'Debug submit:\', {\n                          isSubmitting,\n                          currentStep,\n                          errorsCount: Object.keys(errors).length,\n                          errors,\n                          formData: watch()\n                        });'

fix_file('src/components/auth/RegisterPage.tsx', old, new)
