# 🚢 SIB 2026 - Plateforme Maritime & Portuaire

Plateforme digitale complète pour le salon professionnel SIB (Salon International des Ports d'Afrique).

---

## 🎬 Nouveauté : Contenu Média Enrichi !

✨ **61 contenus média** ont été ajoutés aux pages :
- 🎥 10 Webinaires (~30h)
- 🎙️ 10 Podcasts (~20h)  
- 📹 10 Capsules Inside (~35min)
- 🎬 10 Interviews Live Studio (~23h)
- ⭐ 10 Best Moments (~50min)
- 💬 11 Témoignages (~20min)

**Total : ~75h de contenu multimédia !**

👉 **[Voir le guide complet](README_MEDIA_ENRICHMENT.md)**  
⚡ **[Démarrage rapide](QUICKSTART_MEDIA.md)**

---

## 📚 Documentation Principale

### Getting Started
- [📖 Guide Média Complet](GUIDE_MEDIA_CONTENT.md)
- [⚡ Quick Start Média](QUICKSTART_MEDIA.md)
- [📊 Détails Techniques](MEDIA_CONTENT_ENRICHMENT.md)

### Documentation Technique
- [🎬 Intégration Médias](MEDIA_INTEGRATION_COMPLETE.md)
- [🎯 Fonctionnalités Médias](docs/MEDIA_FEATURES_INTEGRATION.md)
- [🚀 Plan d'Implémentation](docs/MEDIA_IMPLEMENTATION_PLAN.md)

### Tests & Qualité
- [✅ Tests E2E](e2e/README.md)
- [📝 Rapports de Tests](TEST_EXECUTION_REPORT.md)
- [🐛 Corrections](CRASH_FIX_REPORT.md)

---

## 🚀 Installation

### Prérequis
```bash
node >= 18.x
npm >= 9.x
supabase CLI
```

### Installation Standard
```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Supabase
npx supabase start

# 3. Appliquer le contenu média enrichi
.\apply-media-content.ps1
# OU
npx supabase db reset

# 4. Lancer l'application
npm run dev
```

---

## 📱 Pages Disponibles

### Pages Média (Nouveau !)
- `/media/webinars` - Webinaires sponsorisés
- `/media/podcasts` - Podcasts SIB Talks
- `/media/capsules` - Capsules Inside SIB
- `/media/live-studio` - Meet The Leaders
- `/media/best-moments` - Meilleurs moments
- `/media/testimonials` - Témoignages vidéo
- `/media/library` - Bibliothèque complète

### Pages Principales
- `/` - Accueil
- `/events` - Événements
- `/networking` - Réseautage
- `/news` - Actualités
- `/subscription` - Abonnements

---

## 🛠️ Stack Technique

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **UI**: TailwindCSS + Headless UI
- **Media**: Vidéo/Audio streaming
- **Tests**: Playwright E2E
- **Déploiement**: Railway / Vercel

---

## 📊 Statistiques du Projet

- ✅ **250+ tests E2E** validés
- ✅ **61 contenus média** disponibles
- ✅ **~75h de contenu** vidéo/audio
- ✅ **6 types de média** différents
- ✅ **Couverture complète** des fonctionnalités

---

## 🎯 Fonctionnalités Clés

### 🎬 Média & Contenu
- ✅ Webinaires en replay
- ✅ Podcasts SIB Talks
- ✅ Capsules vidéo Inside
- ✅ Interviews Live Studio
- ✅ Best Moments du salon
- ✅ Témoignages partenaires
- ✅ Bibliothèque média centralisée

### 🤝 Networking
- ✅ Profils professionnels
- ✅ Messagerie instantanée
- ✅ Salles de visioconférence
- ✅ Recommandations IA

### 📅 Événements
- ✅ Calendrier interactif
- ✅ Inscriptions en ligne
- ✅ Badges virtuels
- ✅ Check-in QR code

### 💼 Business
- ✅ Abonnements partenaires
- ✅ Packages sponsoring
- ✅ Analytics et reporting
- ✅ ROI tracking

---

## 📖 Documentation Complète

| Document | Description |
|----------|-------------|
| [README_MEDIA_ENRICHMENT.md](README_MEDIA_ENRICHMENT.md) | Index du contenu média |
| [QUICKSTART_MEDIA.md](QUICKSTART_MEDIA.md) | Démarrage rapide (3 étapes) |
| [GUIDE_MEDIA_CONTENT.md](GUIDE_MEDIA_CONTENT.md) | Guide complet d'utilisation |
| [MEDIA_CONTENT_ENRICHMENT.md](MEDIA_CONTENT_ENRICHMENT.md) | Détails techniques |
| [MEDIA_INTEGRATION_COMPLETE.md](MEDIA_INTEGRATION_COMPLETE.md) | État de l'intégration |

---

## 🧪 Tests

```bash
# Tests E2E complets
npm run test:e2e

# Tests E2E média uniquement
npm run test:e2e -- media

# Tests avec UI
npm run test:e2e:ui
```

---

## 🚀 Déploiement

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Avec Docker
```bash
docker-compose up
```

---

## 📝 Scripts Utiles

```bash
# Appliquer le contenu média
.\apply-media-content.ps1

# Reset base de données
npx supabase db reset

# Générer les types TypeScript
npm run types:generate

# Linter & Formatter
npm run lint
npm run format
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation
- Ouvrir une issue GitHub
- Contacter l'équipe SIB

---

## 🎉 Remerciements

- Équipe SIB
- Contributeurs open-source
- Communauté maritime et portuaire

---

**Développé avec ❤️ pour le secteur maritime africain** 🌍⚓

---

*Dernière mise à jour : 22 décembre 2025*
