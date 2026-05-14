"""
Corrige les console.log('debug:', { incorrectement insérés.
Le script fix_orphans_all.py a inséré des console.log à l'intérieur
d'appels de fonctions valides comme `functionCall({`.

Ce script supprime ces insertions incorrectes.
"""
import re
import os

def normalize(content):
    return content.replace('\r\r\n', '\n').replace('\r\n', '\n')

def remove_wrong_debug_logs(filepath):
    """
    Supprime les console.log('debug:', { qui ont été incorrectement insérés
    à l'intérieur d'appels de fonctions.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = normalize(content)
    lines = normalized.split('\n')
    
    fixed = 0
    new_lines = list(lines)
    i = 0
    
    while i < len(new_lines):
        line = new_lines[i]
        stripped = line.strip()
        
        # Trouver les console.log('debug:', { insérés
        if stripped == "console.log('debug:', {":
            # Vérifier le contexte: quelle est la ligne précédente?
            prev_j = i - 1
            while prev_j >= 0 and new_lines[prev_j].strip() == '':
                prev_j -= 1
            
            if prev_j < 0:
                i += 1
                continue
            
            prev_line = new_lines[prev_j].strip()
            
            # Est-ce que la ligne précédente se termine par "({" ?
            # C'est un appel de fonction avec objet: functionName({
            is_function_call = (
                prev_line.endswith('({') or
                prev_line.endswith(', {') or  # argument: func(arg, {
                prev_line.endswith('({') or
                (prev_line.endswith('{') and '(' in prev_line and 
                 not re.match(r'^(if|else|for|while|try|catch|finally|switch)\b', prev_line) and
                 not re.match(r'^(const|let|var|return|export)\b', prev_line) and
                 not prev_line.rstrip().endswith(') {') and
                 not prev_line.rstrip().endswith('=> {') and
                 not prev_line.rstrip().endswith('else {') and
                 not prev_line.rstrip().endswith('try {') and
                 not prev_line.rstrip().endswith('finally {')
                )
            )
            
            # Exemples de FAUX POSITIFS:
            # useAuthStore.setState({ → ends with ({
            # Sentry.setUser({ → ends with ({
            # window.scrollTo({ → ends with ({
            
            # Exemples de VRAIS POSITIFS (à garder):
            # onClick={() => { → ends with {, pas ({
            # if (condition) { → ends with {, pas ({
            # try { → ends with {
            # else { → ends with {
            
            if is_function_call:
                # Supprimer la ligne console.log('debug:', {
                new_lines.pop(i)
                fixed += 1
                # Chercher la fermeture correspondante }); et la remplacer par });
                # La ligne de fermeture était: indent}); → devrait devenir indent});
                # Mais elle est maintenant fermée par le })' original
                # En fait, on doit aussi supprimer le }) supplémentaire
                # La structure est:
                # functionCall({           ← ligne précédente
                # [supprimé] console.log('debug:', {  
                #   key: value,
                # });                      ← fermeture INCORRECTE (avec ))
                # 
                # Après suppression du console.log, les lignes sont:
                # functionCall({
                #   key: value,
                # });
                # Ce qui est syntaxiquement correct!
                # (car la fermeture }); ferme à la fois le { de console.log et le ({ de functionCall)
                # 
                # Mais attends - la fermeture était `});` qui ferme le `console.log('{`.
                # Si on supprime le console.log, le `{` de functionCall n'est plus fermé
                # par le `});`.
                # 
                # En fait: la structure après l'insertion du script était:
                # functionCall({
                #   console.log('debug:', {
                #     key: value,
                #   });        ← ferme le console.log( et son { intérieur
                # 
                # Mais ça ne ferme pas le { de functionCall!
                # 
                # Donc le code cassé est:
                # functionCall({           ← ouvre ( et {
                #   console.log('debug:', {  ← ouvre ( et {
                #     key: value,
                #   });                    ← ferme } de console.log et ) de console.log
                # });                      ← il manque cette ligne!
                #
                # Wait, let me re-read the script output for initAuth.ts:
                # Line 65: useAuthStore.setState({
                # Line 66: console.log('debug:', {
                # Line 67:   user: userProfile,
                # ...
                # Line 71: });
                # 
                # So `});` on line 71 closes console.log( and setState( is NOT closed.
                # 
                # To fix: remove the console.log line, and change `});` to `});` 
                # (which now closes setState). This is already what `});` does.
                # So we just need to remove the console.log line.
                # 
                # Actually wait: `});` has two chars: `}` and `);`
                # `}` closes the `{` from console.log (inner object)
                # `)` closes the `(` from console.log(
                # `;` ends the statement
                # 
                # After removing console.log line:
                # useAuthStore.setState({
                #   user: userProfile,
                #   ...
                # });
                # 
                # `}` closes the `{` from setState
                # `)` closes the `(` from setState
                # OK! This is correct!
                
                print(f"  Supprimé console.log faux positif dans {filepath}:{i+1}")
                continue  # Ne pas incrémenter i car on a supprimé une ligne
        
        i += 1
    
    if fixed > 0:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(new_lines))
        print(f"Corrigé {fixed} faux positif(s) dans: {filepath}")
    
    return fixed

# Traiter tous les fichiers TS/TSX
total_fixed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if not fname.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, fname)
        try:
            fixed = remove_wrong_debug_logs(filepath)
            total_fixed += fixed
        except Exception as e:
            print(f"Erreur dans {filepath}: {e}")

print(f"\nTotal: {total_fixed} faux positifs supprimés")
