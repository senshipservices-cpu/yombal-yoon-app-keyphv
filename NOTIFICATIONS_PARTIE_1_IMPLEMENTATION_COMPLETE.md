
# ✅ Notifications AVANT et PENDANT la Réservation - Implémentation Complète

## 📋 Résumé de l'Implémentation

Toutes les fonctionnalités de notification pour la **Partie 1** (Création & Réservation + Pré-Départ) sont **déjà implémentées et fonctionnelles**.

---

## 1. CRÉATION & RÉSERVATION D'UN TRAJET

### 1.1. Le conducteur publie un trajet ✅

**Edge Function:** `on-ride-created`
**Trigger:** `trigger_on_ride_created` (AFTER INSERT on `carpool_rides`)

**Fonctionnalités:**
- ✅ Notification push au conducteur : "Ton trajet [origine] → [destination] du [date] à [heure] est en ligne ✅"
- ✅ Notification in-app au conducteur
- ✅ Matching automatique avec les alertes de trajets (`ride_alerts`)
- ✅ Notification push aux passagers avec alertes correspondantes
- ✅ Notification in-app aux passagers

**Fichiers:**
- `supabase/functions/on-ride-created/index.ts`
- Trigger SQL: `trigger_on_ride_created_fn()`

---

### 1.2. Le passager demande une réservation ✅

**Edge Function:** `on-reservation-requested`
**Trigger:** `trigger_on_reservation_requested` (AFTER INSERT on `carpool_bookings`)

**Fonctionnalités:**

**Conducteur:**
- ✅ Push : "Nouvelle demande 🚗 : [Nom passager] souhaite une place sur ton trajet."
- ✅ In-app : Notification + boutons Accepter / Refuser
- ✅ WhatsApp (si départ < 2h) : "Nouvelle demande de réservation pour votre trajet. Ouvrez l'app pour répondre."

**Passager:**
- ✅ Push : "Demande envoyée ! En attente de validation."
- ✅ In-app : Statut = "En attente"

**Fichiers:**
- `supabase/functions/on-reservation-requested/index.ts`
- Trigger SQL: `trigger_on_reservation_requested_fn()`

---

### 1.3. Le conducteur accepte la demande ✅

**Edge Function:** `on-reservation-status-changed`
**Trigger:** `trigger_on_reservation_status_changed` (AFTER UPDATE on `carpool_bookings`)

**Fonctionnalités:**

**Passager:**
- ✅ Push : "[Nom conducteur] a accepté ta demande 🎉"
- ✅ WhatsApp (si trajet proche ou push désactivé) : "Votre trajet est confirmé 👍 Rendez-vous au point de rencontre."
- ✅ In-app : Statut = "Confirmé" + contact conducteur

**Conducteur:**
- ✅ In-app : Mise à jour de la liste des passagers confirmés

**Fichiers:**
- `supabase/functions/on-reservation-status-changed/index.ts`
- Trigger SQL: `trigger_on_reservation_status_changed_fn()`

---

### 1.4. Le conducteur refuse ou la demande expire ✅

**Edge Function:** `on-reservation-status-changed`
**Trigger:** `trigger_on_reservation_status_changed` (AFTER UPDATE on `carpool_bookings`)

**Fonctionnalités:**

**Passager:**
- ✅ Push : "[Nom conducteur] n'a pas accepté ta demande."
- ✅ In-app : Statut = "Refusé"

**Fichiers:**
- `supabase/functions/on-reservation-status-changed/index.ts`

---

## 2. PRÉ-DÉPART : RAPPELS

### 2.1. Rappel J-1 ✅

**Edge Function:** `on-ride-reminders` (Cron Job)
**Cron:** Toutes les 10 minutes

**Fonctionnalités:**

**Conducteur:**
- ✅ Push : "Tu conduis demain [origine] → [destination] à [heure]."
- ✅ In-app : Rappel J-1

**Passager:**
- ✅ Push : "Rappel : Trajet demain [origine] → [destination] à [heure]."
- ✅ In-app : Rappel J-1

**Fichiers:**
- `supabase/functions/on-ride-reminders/index.ts`
- Cron Job ID: 1 (schedule: `*/10 * * * *`)

---

### 2.2. Rappel H-1 ✅

**Edge Function:** `on-ride-reminders` (Cron Job)
**Cron:** Toutes les 10 minutes

**Fonctionnalités:**

**Conducteur:**
- ✅ WhatsApp : "Votre trajet commence dans 1 heure."
- ✅ Push : "Ton trajet démarre dans 1h."
- ✅ In-app : Rappel H-1

**Passager:**
- ✅ WhatsApp : "Votre trajet commence dans 1 heure. Soyez à l'heure 📍"
- ✅ Push : "Ton trajet démarre dans 1h."
- ✅ In-app : Rappel H-1

**Fichiers:**
- `supabase/functions/on-ride-reminders/index.ts`

---

### 2.3. Conducteur : "Je suis arrivé" ✅

**Edge Function:** `on-driver-arrived`
**Déclenchement:** Bouton "Je suis arrivé" dans l'app

**Fonctionnalités:**

**Passagers:**
- ✅ Push : "[Nom conducteur] est arrivé 📍 Rendez-vous au point de rencontre."
- ✅ WhatsApp : "Le conducteur est arrivé. Rejoignez-le dans les 5 minutes."
- ✅ In-app : Alerte + pop-up

**Fichiers:**
- `supabase/functions/on-driver-arrived/index.ts`
- UI: `app/covoiturage/my-rides.tsx` (bouton "Je suis arrivé")
- Context: `contexts/CovoiturageContext.tsx` (`markDriverArrived()`)

---

## 3. ARCHITECTURE TECHNIQUE

### Edge Functions Déployées

| Fonction | Status | Verify JWT | Description |
|----------|--------|------------|-------------|
| `on-ride-created` | ✅ Active | true | Notifications création trajet + matching alertes |
| `on-reservation-requested` | ✅ Active | true | Notifications demande réservation |
| `on-reservation-status-changed` | ✅ Active | true | Notifications acceptation/refus |
| `on-ride-reminders` | ✅ Active | true | Rappels J-1 et H-1 (cron) |
| `on-driver-arrived` | ✅ Active | true | Notifications arrivée conducteur |
| `send-notification-unified` | ✅ Active | true | Handler unifié pour toutes les notifications |

### Database Triggers

| Trigger | Table | Event | Fonction |
|---------|-------|-------|----------|
| `trigger_on_ride_created` | `carpool_rides` | AFTER INSERT | `trigger_on_ride_created_fn()` |
| `trigger_on_reservation_requested` | `carpool_bookings` | AFTER INSERT | `trigger_on_reservation_requested_fn()` |
| `trigger_on_reservation_status_changed` | `carpool_bookings` | AFTER UPDATE | `trigger_on_reservation_status_changed_fn()` |

### Cron Jobs

| Job ID | Schedule | Fonction | Description |
|--------|----------|----------|-------------|
| 1 | `*/10 * * * *` | `on-ride-reminders` | Rappels J-1 et H-1 |
| 2 | `*/5 * * * *` | `on-rating-request` | Demandes de notation |

---

## 4. CANAUX DE NOTIFICATION

### In-App Notifications ✅
- Table: `notifications`
- Affichage: Cloche dans l'app
- Statut: `is_read`, `read_at`

### Push Notifications ✅
- Service: Expo Push Notifications / FCM
- Table: `device_tokens`
- Gestion: Tokens actifs/inactifs, dernière utilisation

### WhatsApp Notifications ✅
- Service: Twilio
- Opt-in: `user_profiles.whatsapp_optin`
- Conditions:
  - Départ < 2h (réservation urgente)
  - Départ < 4h (acceptation proche)
  - H-1 (rappel)
  - Arrivée conducteur

---

## 5. CONFIGURATION

### Variables d'Environnement (Supabase Secrets)

```bash
SUPABASE_URL=https://drxtaxepofuoelplgrei.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<votre_clé>
TWILIO_ACCOUNT_SID=<votre_sid>
TWILIO_AUTH_TOKEN=<votre_token>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
IS_PRODUCTION_MODE=true  # ou false pour test
```

### Table `app_config`

```sql
INSERT INTO app_config (key, value) VALUES
  ('supabase_url', 'https://drxtaxepofuoelplgrei.supabase.co'),
  ('service_role_key', '<votre_service_role_key>');
```

---

## 6. LOGS ET MONITORING

### Table `notification_logs`

Tous les envois de notifications sont loggés avec:
- `user_id`: Destinataire
- `channel`: in_app, push, whatsapp
- `status`: success, error, pending
- `payload`: Contenu de la notification
- `error_message`: Message d'erreur si échec
- `created_at`: Timestamp

### Requête de Monitoring

```sql
-- Voir les notifications des dernières 24h
SELECT 
  user_id,
  channel,
  status,
  payload_text,
  created_at
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Taux de succès par canal
SELECT 
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel;
```

---

## 7. MODE TEST vs PRODUCTION

### Mode Test (`IS_PRODUCTION_MODE=false`)
- ✅ In-app notifications: **Envoyées**
- ❌ Push notifications: **Bloquées** (loggées uniquement)
- ❌ WhatsApp notifications: **Bloquées** (loggées uniquement)

### Mode Production (`IS_PRODUCTION_MODE=true`)
- ✅ In-app notifications: **Envoyées**
- ✅ Push notifications: **Envoyées**
- ✅ WhatsApp notifications: **Envoyées** (si opt-in)

---

## 8. TESTS RECOMMANDÉS

### Test 1: Publication de Trajet
1. Créer un trajet via l'app
2. Vérifier notification in-app conducteur
3. Vérifier notification push conducteur
4. Si alerte correspondante existe, vérifier notification passager

### Test 2: Demande de Réservation
1. Créer une réservation
2. Vérifier notification in-app + push conducteur
3. Si départ < 2h, vérifier WhatsApp conducteur
4. Vérifier notification in-app passager

### Test 3: Acceptation de Réservation
1. Accepter une réservation
2. Vérifier notification in-app + push passager
3. Si départ < 4h, vérifier WhatsApp passager

### Test 4: Rappels
1. Créer un trajet pour demain
2. Attendre le cron J-1 (max 10 min)
3. Vérifier notifications conducteur + passagers
4. Créer un trajet pour dans 1h
5. Attendre le cron H-1 (max 10 min)
6. Vérifier notifications + WhatsApp

### Test 5: Arrivée Conducteur
1. Cliquer sur "Je suis arrivé"
2. Vérifier notifications in-app + push + WhatsApp passagers

---

## 9. DÉPANNAGE

### Problème: Notifications non reçues

**Vérifications:**
1. Vérifier `IS_PRODUCTION_MODE` dans Supabase Secrets
2. Vérifier tokens dans `device_tokens` (actifs)
3. Vérifier opt-in WhatsApp dans `user_profiles`
4. Consulter `notification_logs` pour erreurs
5. Vérifier logs Edge Functions dans Dashboard Supabase

### Problème: Triggers ne se déclenchent pas

**Vérifications:**
1. Vérifier `app_config` contient `supabase_url` et `service_role_key`
2. Vérifier extension `pg_net` est activée
3. Consulter logs Postgres pour warnings
4. Tester manuellement l'Edge Function

### Problème: Cron jobs ne s'exécutent pas

**Vérifications:**
1. Vérifier extension `pg_cron` est activée
2. Vérifier jobs dans `cron.job` (active=true)
3. Consulter `cron.job_run_details` pour historique
4. Tester manuellement l'Edge Function

---

## 10. PROCHAINES ÉTAPES

### Partie 2: Notifications PENDANT et APRÈS le Trajet
- Démarrage du trajet
- Fin du trajet
- Demandes de notation
- Notifications de paiement

### Améliorations Futures
- Notifications par email
- Notifications SMS (via Twilio)
- Personnalisation des préférences de notification
- Historique des notifications dans l'app
- Statistiques de livraison

---

## 📞 Support

Pour toute question ou problème:
1. Consulter les logs dans `notification_logs`
2. Vérifier les logs Edge Functions dans Supabase Dashboard
3. Tester en mode `IS_PRODUCTION_MODE=false` d'abord
4. Consulter la documentation Twilio pour WhatsApp
5. Consulter la documentation Expo pour Push Notifications

---

**Date de dernière mise à jour:** 2025-02-03
**Version:** 1.0.0
**Status:** ✅ Production Ready
