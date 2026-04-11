# 🚀 Installation rapide - Plugin WordPress Elementor

## 📋 Prérequis

✅ WordPress 5.8+  
✅ PHP 7.4+  
✅ Elementor Pro 3.0+ (optionnel mais recommandé)  

---

## ⚡ Installation en 3 étapes

### 1️⃣ Préparer le plugin

```bash
# Depuis le dossier du projet
cd wordpress-plugin

# Créer le fichier ZIP
# Windows PowerShell:
Compress-Archive -Path * -DestinationPath siports-articles-shortcode.zip

# Linux/Mac:
zip -r siports-articles-shortcode.zip *
```

### 2️⃣ Installer sur WordPress

1. **Connexion WordPress**
   - Allez sur `https://votre-site.com/wp-admin`
   - Connectez-vous en admin

2. **Upload du plugin**
   - Allez dans **Extensions** → **Ajouter**
   - Cliquez sur **Téléverser une extension**
   - Sélectionnez `siports-articles-shortcode.zip`
   - Cliquez sur **Installer maintenant**
   - Cliquez sur **Activer**

3. **Vérifier l'installation**
   - Allez dans **Réglages** → **SIPORTS Articles**
   - Si Elementor est installé, vous verrez "✅ Elementor détecté"

### 3️⃣ Premier test

**Méthode A : Shortcode**

1. Créez une nouvelle **Page**
2. Ajoutez un bloc **Shortcode**
3. Collez :
   ```
   [article id="00000000-0000-0000-0000-000000000401"]
   ```
4. **Prévisualisez** la page

**Méthode B : Elementor** (si installé)

1. Créez une nouvelle page avec **Elementor**
2. Cherchez le widget **"SIPORTS Article"**
3. Glissez-déposez le widget
4. Entrez l'**ID de l'article**
5. Cliquez sur **Publier**

---

## 🎯 Obtenir un ID d'article

1. Allez sur `https://siportv3.up.railway.app/marketing/dashboard`
2. Connectez-vous en **admin**
3. Onglet **"Articles"**
4. Cliquez sur **📋 Copier** le shortcode
5. L'ID est dans le shortcode : `[article id="UUID-ICI"]`

---

## 🧪 Tester l'API

Ouvrez dans votre navigateur :
```
https://siportv3.up.railway.app/api/articles/00000000-0000-0000-0000-000000000401
```

Vous devriez voir un JSON avec les données de l'article.

---

## ❓ Problèmes courants

### Le shortcode ne fonctionne pas

✔️ Vérifiez que le plugin est **activé**  
✔️ Vérifiez l'**ID de l'article** (copier-coller depuis le dashboard)  
✔️ Videz le **cache WordPress**  

### Le widget Elementor n'apparaît pas

✔️ Installez **Elementor Pro** (version 3.0+)  
✔️ **Désactivez** puis **réactivez** le plugin  
✔️ Videz le **cache d'Elementor** (Elementor → Outils → Régénérer CSS)  

### Erreur "Article non trouvé"

✔️ L'article doit être **publié** (✅ statut)  
✔️ Testez l'API directement dans le navigateur  
✔️ Videz le cache : **Réglages** → **SIPORTS Articles** → **Vider le cache**  

---

## 📚 Documentation complète

Consultez `README.md` pour :
- Options avancées du shortcode
- Personnalisation du style
- API REST complète
- Exemples de layouts
- Dépannage détaillé

---

## 💡 Exemples rapides

### Article complet avec image
```
[article id="uuid"]
```

### Article compact sans tags
```
[article id="uuid" layout="compact" show_tags="no"]
```

### Article minimal (titre + extrait uniquement)
```
[article id="uuid" layout="minimal" show_content="no"]
```

---

## 📞 Support

**Email :** support@siportevent.com  
**Discord :** #support-wordpress  

---

✅ **Installation terminée !**  
Vous pouvez maintenant afficher vos articles SIPORTS partout sur votre site WordPress.
