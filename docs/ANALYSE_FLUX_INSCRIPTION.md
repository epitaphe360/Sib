# Analyse Complète des Flux d'Inscription et Paiement

## Table des Matières
1. [Flux Visiteur VIP](#1-flux-visiteur-vip)
2. [Flux Exposant](#2-flux-exposant)
3. [Flux Partenaire](#3-flux-partenaire)
4. [Bugs et Problèmes Identifiés](#4-bugs-et-problèmes-identifiés)
5. [Recommandations](#5-recommandations)

---

## 1. Flux Visiteur VIP

### 1.1 Schéma du Flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INSCRIPTION VISITEUR VIP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /visitor/vip-registration                                          │
│  ↓                                                                  │
│  Formulaire:                                                        │
│  - firstName, lastName, email, phone, country, sector               │
│  - password (8+ chars, maj, min, chiffre, spécial)                 │
│  - company, position (OBLIGATOIRES pour VIP)                        │
│  - photo (OBLIGATOIRE, max 5MB)                                     │
│  ↓                                                                  │
│  Upload photo → storage/visitor-photos/                             │
│  ↓                                                                  │
│  supabase.auth.signUp() → Création compte Auth                      │
│  ↓                                                                  │
│  INSERT users → status='pending_payment', visitor_level='vip'       │
│  ↓                                                                  │
│  INSERT payment_requests → amount=700 EUR, status='pending'         │
│  ↓                                                                  │
│  Envoi email instructions paiement                                  │
│  ↓                                                                  │
│  Redirect → /visitor/payment                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         PAIEMENT                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /visitor/payment                                                   │
│  ↓                                                                  │
│  Choix méthode: Stripe | PayPal | CMI (Maroc)                      │
│  ↓                                                                  │
│  [Stripe] → Redirect checkout Stripe → Webhook confirmation         │
│  [PayPal] → PayPal buttons → Capture order                         │
│  [CMI]    → Redirect gateway CMI → Callback                        │
│  ↓                                                                  │
│  /visitor/payment-success                                           │
│  ↓                                                                  │
│  Vérification: checkPaymentStatus()                                 │
│  ↓                                                                  │
│  upgradeUserToVIP():                                                │
│    - UPDATE users SET visitor_level='premium', status='active'      │
│    - UPDATE payment_requests SET status='approved'                  │
│  ↓                                                                  │
│  Génération badge VIP                                               │
│  ↓                                                                  │
│  Redirect → /visitor/dashboard ✅                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Tables Impactées

| Table | Opération | Champs Clés |
|-------|-----------|-------------|
| `auth.users` | INSERT | email, password |
| `users` | INSERT | id, email, name, type='visitor', visitor_level='vip', status='pending_payment', profile (JSONB) |
| `payment_requests` | INSERT | user_id, amount=700, currency='EUR', status='pending', metadata={type:'visitor_vip_upgrade'} |
| `visitor_profiles` | INSERT (optionnel) | user_id, first_name, last_name, pass_type |

### 1.3 Fichiers Clés

| Fichier | Lignes | Fonction |
|---------|--------|----------|
| `src/pages/visitor/VisitorVIPRegistration.tsx` | 97-227 | Formulaire inscription |
| `src/pages/VisitorPaymentPage.tsx` | 51-140 | Page paiement |
| `src/pages/visitor/PaymentSuccessPage.tsx` | 28-71 | Validation post-paiement |
| `src/services/paymentService.ts` | 217-243 | upgradeUserToVIP() |
| `src/store/authStore.ts` | 107-109 | Validation status login |

---

## 2. Flux Exposant

### 2.1 Schéma du Flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INSCRIPTION EXPOSANT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /register/exhibitor                                                │
│  ↓                                                                  │
│  Formulaire multi-étapes (6 étapes):                               │
│  - Infos personnelles: firstName, lastName, email, password        │
│  - Infos entreprise: companyName, sectors[], country, website      │
│  - Détails: position, companyDescription                           │
│  - Abonnement: standArea (9/18/36/54 m²), subscriptionPrice        │
│  - Validation reCAPTCHA                                            │
│  ↓                                                                  │
│  supabase.auth.signUp() → Création compte Auth                      │
│  ↓                                                                  │
│  INSERT users → type='exhibitor', status='pending'                  │
│  ↓                                                                  │
│  INSERT exhibitors → verified=false                                 │
│  ↓                                                                  │
│  INSERT exhibitor_profiles → stand_area, company_name               │
│  ↓                                                                  │
│  INSERT registration_requests → status='pending'                    │
│  ↓                                                                  │
│  INSERT payment_requests → amount selon stand, status='pending'     │
│  ↓                                                                  │
│  Envoi email confirmation + instructions paiement                   │
│  ↓                                                                  │
│  Redirect → /pending-account                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    APPROBATION ADMIN                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Admin Dashboard → /admin/registration-requests                     │
│  ↓                                                                  │
│  Admin clique "Approuver"                                           │
│  ↓                                                                  │
│  validate_exhibitor_atomic():                                       │
│    - UPDATE registration_requests SET status='approved'             │
│    - UPDATE exhibitors SET verified=true                            │
│    - UPDATE users SET status='active' ✅                            │
│  ↓                                                                  │
│  Envoi email notification approbation                               │
│  ↓                                                                  │
│  Exposant peut se connecter → /exhibitor/dashboard ✅               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tables Impactées

| Table | Opération | Champs Clés |
|-------|-----------|-------------|
| `auth.users` | INSERT | email, password |
| `users` | INSERT | id, email, name, type='exhibitor', status='pending', profile |
| `exhibitors` | INSERT | user_id, company_name, sector, verified=false |
| `exhibitor_profiles` | INSERT | user_id, company_name, stand_area, stand_number |
| `registration_requests` | INSERT | user_type='exhibitor', status='pending', profile_data |
| `payment_requests` | INSERT | user_id, amount, status='pending' |

### 2.3 Tarification Stands

| Taille | Prix | RDV B2B | Team Members |
|--------|------|---------|--------------|
| 9m² (Basic) | Variable | 0 | 1 |
| 18m² (Standard) | Variable | 15 | 2 |
| 36m² (Premium) | Variable | 30 | 5 |
| 54m² (Elite) | Variable | Illimité | 10 |

---

## 3. Flux Partenaire

### 3.1 Schéma du Flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INSCRIPTION PARTENAIRE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /register/partner                                                  │
│  ↓                                                                  │
│  Formulaire:                                                        │
│  - Organisation: companyName, sectors[], country, website           │
│  - Contact: firstName, lastName, position, email, phone, password   │
│  - Type partenariat: institutionnel/media/technologique/etc.        │
│  - Description entreprise                                           │
│  - Validation reCAPTCHA                                            │
│  ↓                                                                  │
│  supabase.auth.signUp() → Création compte Auth                      │
│  ↓                                                                  │
│  INSERT users → type='partner', status='pending'                    │
│  ↓                                                                  │
│  INSERT partners → company_name, partner_type                       │
│  ↓                                                                  │
│  INSERT registration_requests → status='pending'                    │
│  ↓                                                                  │
│  Envoi email confirmation                                           │
│  ↓                                                                  │
│  Redirect → /pending-account                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    ⚠️ PROBLÈME: APPROBATION                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Admin approuve dans /admin/registration-requests                   │
│  ↓                                                                  │
│  UPDATE registration_requests SET status='approved' ✅              │
│  ↓                                                                  │
│  ⚠️ MAIS: users.status reste 'pending' ❌                          │
│  ↓                                                                  │
│  Partenaire essaie de se connecter                                  │
│  ↓                                                                  │
│  ❌ ERREUR: "Votre compte est en attente de validation"            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Tarification Partenaires

| Tier | Prix | RDV B2B | Events | Media | Team |
|------|------|---------|--------|-------|------|
| Museum | $20,000 | 20 | 5 | 10 | 3 |
| Silver | $48,000 | 50 | 10 | 30 | 5 |
| Gold | $68,000 | 100 | 20 | 75 | 10 |
| Platinium | $98,000 | Illimité | 20+ | 200 | 20 |

---

## 4. Bugs et Problèmes Identifiés

### 4.1 CRITIQUE: Partenaires ne peuvent pas se connecter après approbation

**Fichier:** `src/services/supabaseService.ts` (lignes 2387-2413)

**Problème:** La fonction `updateRegistrationRequestStatus()` met à jour SEULEMENT `registration_requests.status` mais NE MET PAS À JOUR `users.status`.

**Code actuel:**
```typescript
static async updateRegistrationRequestStatus(requestId, status, reviewedBy) {
  await supabase
    .from('registration_requests')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId);
  // ⚠️ MANQUE: UPDATE users SET status='active'
}
```

**Impact:** Les partenaires approuvés ont:
- `registration_requests.status = 'approved'`
- `users.status = 'pending'` (INCHANGÉ)

Lors de la connexion, le code vérifie:
```typescript
// authStore.ts ligne 107-109
if (user.status && user.status !== 'active') {
  throw new Error('Votre compte est en attente de validation');
}
```

### 4.2 Tables dupliquées pour Partenaires

**Problème:** Deux tables existent pour les partenaires:
- `partners` - Pour l'affichage public (page partenaires, accueil)
- `partner_profiles` - Pour les profils utilisateurs

**Impact:**
- Données incohérentes entre les deux tables
- La fonction `createPartnerProfile()` insère dans `partners` avec un `user_id` qui peut ne pas correspondre au schéma

### 4.3 Colonnes mal nommées dans getPartners()

**Fichier:** `src/services/supabaseService.ts` (lignes 303-338)

**Corrigé dans cette session** - Les noms de colonnes ne correspondaient pas:
- `company_name` → `name`
- `partner_type` → `type`
- `partnership_level` → `sponsorship_level`

### 4.4 VisitorLevelGuard bloquait les visiteurs FREE

**Fichier:** `src/components/visitor/VisitorDashboard.tsx`

**Corrigé dans cette session** - Le guard `<VisitorLevelGuard requiredLevel="premium">` empêchait les visiteurs gratuits d'accéder à leur tableau de bord.

### 4.5 Filtrage incorrect des RDV partenaires

**Fichier:** `src/components/dashboard/PartnerDashboard.tsx` (ligne 130)

**Corrigé dans cette session** - Le filtre utilisait `visitorId` au lieu de `exhibitorId`.

### 4.6 Pas de sélection de tier lors de l'inscription partenaire

**Problème:** Le formulaire d'inscription partenaire ne permet pas de sélectionner le tier (Museum/Silver/Gold/Platinium).

**Impact:**
- `users.partner_tier` n'est pas défini
- Le paiement ne peut pas être calculé correctement

### 4.7 Pas de workflow de paiement pour partenaires

**Problème:** Contrairement aux visiteurs VIP, les partenaires n'ont pas de flux de paiement intégré.

**Impact:**
- Pas de `payment_requests` créé à l'inscription
- Pas de page `/partner/payment`
- Le paiement doit être géré manuellement (virement bancaire)

---

## 5. Recommandations

### 5.1 Correction URGENTE: Activation automatique partenaires

Créer une fonction SQL `validate_partner_atomic()` similaire à `validate_exhibitor_atomic()`:

```sql
CREATE OR REPLACE FUNCTION validate_partner_atomic(
  p_request_id UUID,
  p_new_status TEXT,
  p_admin_id UUID
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'user_id
  SELECT user_id INTO v_user_id
  FROM registration_requests
  WHERE id = p_request_id;

  -- Mettre à jour registration_requests
  UPDATE registration_requests
  SET status = p_new_status,
      reviewed_by = p_admin_id,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  -- IMPORTANT: Mettre à jour users.status
  IF p_new_status = 'approved' THEN
    UPDATE users
    SET status = 'active'
    WHERE id = v_user_id;

    -- Mettre à jour partners.verified
    UPDATE partners
    SET verified = true
    WHERE user_id = v_user_id OR id = v_user_id;
  ELSIF p_new_status = 'rejected' THEN
    UPDATE users
    SET status = 'rejected'
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Unifier les tables partenaires

Décider d'une seule table canonique:
- Soit `partners` pour tout
- Soit `partner_profiles` + `partners` avec relation claire

### 5.3 Ajouter sélection de tier à l'inscription partenaire

Modifier `PartnerSignUpPage.tsx` pour inclure:
- Sélecteur de tier (Museum/Silver/Gold/Platinium)
- Affichage du prix correspondant
- Création de `payment_requests` avec le bon montant

### 5.4 Créer un workflow de paiement partenaire

Similaire aux visiteurs VIP:
- Page `/partner/payment` avec options de paiement
- Webhook pour validation automatique
- Mise à jour du statut après paiement

---

## Annexe: Statuts et leur signification

| Statut | Table | Signification | Accès Dashboard |
|--------|-------|---------------|-----------------|
| `pending` | users | En attente validation email/admin | NON |
| `pending_payment` | users | En attente paiement (VIP) | NON |
| `active` | users | Compte validé et actif | OUI |
| `suspended` | users | Compte suspendu par admin | NON |
| `rejected` | users | Inscription rejetée | NON |
| `pending` | registration_requests | En attente revue admin | - |
| `approved` | registration_requests | Approuvé par admin | - |
| `rejected` | registration_requests | Rejeté par admin | - |
| `pending` | payment_requests | Paiement en attente | - |
| `approved` | payment_requests | Paiement validé | - |
