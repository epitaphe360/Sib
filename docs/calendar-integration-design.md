# Conception de l'Intégration des Calendriers Externes et des Notifications

**Auteur:** Manus AI  
**Date:** 4 octobre 2025

## Objectif

Ce document décrit la conception technique pour l'intégration de la synchronisation des rendez-vous avec les calendriers externes (Google Calendar, Outlook, Apple Calendar) et l'implémentation d'un système de notifications et de rappels pour les rendez-vous dans l'application SIPORT v3.

## 1. Synchronisation avec les Calendriers Externes

### 1.1 Google Calendar API

L'intégration avec Google Calendar utilise l'API RESTful de Google qui permet de créer, modifier et gérer des événements dans les calendriers des utilisateurs.

**Fonctionnalités principales:**
- Création d'événements de calendrier lors de la confirmation d'un rendez-vous
- Mise à jour des événements existants en cas de modification de rendez-vous
- Suppression d'événements en cas d'annulation de rendez-vous
- Synchronisation bidirectionnelle (optionnelle pour les phases futures)

**Étapes d'intégration:**
1. Configuration du projet Google Cloud et activation de l'API Google Calendar
2. Configuration de l'écran de consentement OAuth 2.0
3. Génération des identifiants OAuth (Client ID et Client Secret)
4. Implémentation du flux d'authentification OAuth dans l'application
5. Stockage sécurisé des tokens d'accès et de rafraîchissement
6. Implémentation des fonctions d'ajout/modification/suppression d'événements

**Scopes requis:**
- `https://www.googleapis.com/auth/calendar.events` - Accès aux événements du calendrier

### 1.2 Microsoft Outlook Calendar API

L'intégration avec Outlook utilise l'API Microsoft Graph qui fournit un point d'accès unifié aux services Microsoft 365.

**Fonctionnalités principales:**
- Création d'événements de calendrier
- Mise à jour et suppression d'événements
- Gestion des rappels et notifications

**Étapes d'intégration:**
1. Enregistrement de l'application dans le portail Azure AD
2. Configuration des permissions d'API Microsoft Graph
3. Implémentation du flux OAuth 2.0 pour Microsoft
4. Stockage des tokens d'accès
5. Implémentation des opérations CRUD sur les événements

**Permissions requises:**
- `Calendars.ReadWrite` - Lecture et écriture des calendriers de l'utilisateur

### 1.3 Apple Calendar (iCal)

Pour Apple Calendar, l'approche recommandée est l'utilisation du format iCalendar (.ics) qui est un standard ouvert supporté par la plupart des applications de calendrier.

**Fonctionnalités principales:**
- Génération de fichiers .ics pour les rendez-vous
- Envoi de fichiers .ics par email
- Liens de téléchargement pour ajouter au calendrier

**Implémentation:**
1. Création d'une bibliothèque de génération de fichiers iCalendar
2. Génération de fichiers .ics avec les détails du rendez-vous
3. Fourniture d'un lien de téléchargement ou envoi par email

## 2. Système de Notifications et de Rappels

### 2.1 Types de Notifications

**Notifications Push:**
- Utilisation de Firebase Cloud Messaging (FCM) pour les notifications push sur mobile et web
- Notifications envoyées 24h, 1h et 15 minutes avant le rendez-vous

**Notifications par Email:**
- Envoi d'emails de rappel via un service d'emailing (ex: SendGrid, AWS SES)
- Emails envoyés 24h et 1h avant le rendez-vous

**Notifications In-App:**
- Badge de notification dans l'interface utilisateur
- Centre de notifications accessible depuis le header

### 2.2 Architecture du Système de Notifications

**Composants:**
1. **Service de Planification:** Utilise un système de tâches planifiées (cron jobs ou service de queue comme Bull/BullMQ)
2. **Service de Notification:** Gère l'envoi des notifications via différents canaux
3. **Base de Données:** Stocke les préférences de notification des utilisateurs et l'historique des notifications envoyées

**Flux de travail:**
1. Lors de la création d'un rendez-vous, des tâches de notification sont planifiées
2. Le service de planification vérifie régulièrement les rendez-vous à venir
3. Lorsqu'un seuil de temps est atteint, le service de notification envoie les rappels
4. L'historique des notifications est enregistré pour éviter les doublons

### 2.3 Préférences Utilisateur

Les utilisateurs peuvent configurer leurs préférences de notification:
- Activer/désactiver les notifications push
- Activer/désactiver les notifications par email
- Choisir les délais de rappel (15 min, 1h, 24h, personnalisé)
- Définir les canaux de notification préférés

## 3. Modifications de la Base de Données

### 3.1 Nouvelle Table: `calendar_connections`

```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'outlook', 'apple'
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  calendar_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Nouvelle Table: `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  reminder_times INTEGER[] DEFAULT ARRAY[15, 60, 1440], -- en minutes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Nouvelle Table: `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'push', 'email', 'in-app'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Modification de la Table: `appointments`

```sql
ALTER TABLE appointments ADD COLUMN external_calendar_event_id VARCHAR(255);
ALTER TABLE appointments ADD COLUMN calendar_provider VARCHAR(50);
```

## 4. Composants Frontend

### 4.1 Composant: `CalendarSyncSettings`

Un composant permettant aux utilisateurs de connecter et gérer leurs calendriers externes.

**Fonctionnalités:**
- Boutons de connexion pour Google, Outlook, Apple
- Affichage de l'état de connexion
- Déconnexion des calendriers
- Choix du calendrier par défaut pour la synchronisation

### 4.2 Composant: `NotificationPreferences`

Un composant pour gérer les préférences de notification.

**Fonctionnalités:**
- Toggles pour activer/désactiver les notifications push et email
- Sélection des délais de rappel
- Prévisualisation des notifications

### 4.3 Composant: `NotificationCenter`

Un centre de notifications accessible depuis le header.

**Fonctionnalités:**
- Liste des notifications récentes
- Badge indiquant le nombre de notifications non lues
- Marquage des notifications comme lues
- Liens directs vers les rendez-vous concernés

## 5. Services Backend

### 5.1 Service: `CalendarSyncService`

Gère la synchronisation avec les calendriers externes.

**Méthodes principales:**
- `connectGoogleCalendar(userId, authCode)` - Connecte un compte Google Calendar
- `connectOutlookCalendar(userId, authCode)` - Connecte un compte Outlook
- `syncAppointmentToCalendar(appointmentId)` - Synchronise un rendez-vous vers le calendrier externe
- `updateCalendarEvent(appointmentId)` - Met à jour un événement de calendrier
- `deleteCalendarEvent(appointmentId)` - Supprime un événement de calendrier
- `refreshAccessToken(userId, provider)` - Rafraîchit le token d'accès

### 5.2 Service: `NotificationService`

Gère l'envoi des notifications.

**Méthodes principales:**
- `scheduleNotifications(appointmentId)` - Planifie les notifications pour un rendez-vous
- `sendPushNotification(userId, message)` - Envoie une notification push
- `sendEmailNotification(userId, subject, body)` - Envoie une notification par email
- `createInAppNotification(userId, message)` - Crée une notification in-app
- `cancelNotifications(appointmentId)` - Annule les notifications planifiées

### 5.3 Service: `NotificationScheduler`

Service de planification des notifications.

**Fonctionnalités:**
- Vérification périodique des rendez-vous à venir
- Déclenchement des notifications aux moments appropriés
- Gestion de la file d'attente des notifications
- Retry logic en cas d'échec d'envoi

## 6. Sécurité et Confidentialité

### 6.1 Stockage des Tokens

- Les tokens d'accès et de rafraîchissement doivent être chiffrés en base de données
- Utilisation de variables d'environnement pour les secrets OAuth
- Rotation régulière des tokens de rafraîchissement

### 6.2 Consentement Utilisateur

- Demande explicite de consentement avant la connexion aux calendriers
- Explication claire des permissions demandées
- Possibilité de révoquer l'accès à tout moment

### 6.3 Conformité RGPD

- Suppression des données de calendrier lors de la déconnexion
- Suppression des tokens lors de la suppression du compte utilisateur
- Transparence sur l'utilisation des données

## 7. Plan de Mise en Œuvre

### Phase 1: Infrastructure de Base
1. Création des tables de base de données
2. Configuration des projets OAuth (Google, Microsoft)
3. Mise en place du service de notification de base

### Phase 2: Intégration Google Calendar
1. Implémentation du flux OAuth pour Google
2. Développement du service de synchronisation Google Calendar
3. Création du composant frontend de connexion

### Phase 3: Intégration Outlook Calendar
1. Implémentation du flux OAuth pour Microsoft
2. Développement du service de synchronisation Outlook
3. Intégration dans le composant frontend

### Phase 4: Support Apple Calendar (iCal)
1. Développement de la génération de fichiers .ics
2. Intégration des liens de téléchargement

### Phase 5: Système de Notifications
1. Implémentation du service de notification push (FCM)
2. Implémentation du service de notification par email
3. Développement du centre de notifications in-app
4. Mise en place du scheduler de notifications

### Phase 6: Tests et Optimisation
1. Tests unitaires et d'intégration
2. Tests utilisateurs
3. Optimisation des performances
4. Documentation utilisateur

## 8. Considérations Techniques

### 8.1 Gestion des Fuseaux Horaires

- Tous les rendez-vous doivent être stockés en UTC dans la base de données
- Conversion vers le fuseau horaire local de l'utilisateur lors de l'affichage
- Prise en compte du fuseau horaire lors de la création d'événements de calendrier

### 8.2 Gestion des Conflits

- Détection des conflits de rendez-vous avant la création
- Vérification de la disponibilité dans le calendrier externe (optionnel)
- Notification à l'utilisateur en cas de conflit potentiel

### 8.3 Scalabilité

- Utilisation d'une file d'attente pour les tâches de synchronisation
- Limitation du taux de requêtes vers les APIs externes
- Mise en cache des informations de calendrier fréquemment consultées

## 9. Métriques de Succès

- Taux d'adoption de la synchronisation de calendrier
- Taux de réduction des absences aux rendez-vous
- Satisfaction utilisateur concernant les notifications
- Temps de réponse des synchronisations
- Taux de succès des envois de notifications

## Conclusion

Cette conception fournit une base solide pour l'implémentation de la synchronisation des calendriers externes et d'un système de notifications robuste. L'approche modulaire permet une mise en œuvre progressive et facilite la maintenance et l'évolution futures du système.
