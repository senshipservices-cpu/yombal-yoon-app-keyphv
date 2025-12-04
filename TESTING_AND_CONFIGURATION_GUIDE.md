
# 🧪 GUIDE DE TEST ET CONFIGURATION - SYSTÈME DE NOTIFICATIONS COVOITURAGE

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Étape 1 : Tests en environnement de développement](#étape-1--tests-en-environnement-de-développement)
3. [Étape 2 : Configuration des cron jobs](#étape-2--configuration-des-cron-jobs)
4. [Étape 3 : Vérification IS_PRODUCTION_MODE](#étape-3--vérification-is_production_mode)
5. [Étape 4 : Tests en production (pilote)](#étape-4--tests-en-production-pilote)
6. [Étape 5 : Surveillance des logs](#étape-5--surveillance-des-logs)
7. [Checklist finale](#checklist-finale)

---

## 🎯 VUE D'ENSEMBLE

Ce guide couvre les 5 étapes essentielles pour valider et déployer le système de notifications du module Covoiturage :

- ✅ Tests complets en développement
- ⏰ Configuration des cron jobs Supabase
- 🔧 Vérification du mode production
- 🧑‍🔬 Tests pilotes en production
- 📊 Surveillance et monitoring

---

## 📝 ÉTAPE 1 : TESTS EN ENVIRONNEMENT DE DÉVELOPPEMENT

### 1.1 Préparation de l'environnement de test

**Vérifier que IS_PRODUCTION_MODE est à false :**

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = false; // Mode test
```

**Vérifier les secrets Supabase Edge Functions :**

```bash
# Vérifier que les secrets sont configurés
supabase secrets list

# Secrets requis :
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_WHATSAPP_FROM
# - IS_PRODUCTION_MODE=false (pour les tests)
```

### 1.2 Scénarios de test à valider

#### ✅ SCÉNARIO 1 : Publication de trajet

**Actions :**
1. Créer un compte conducteur de test
2. Publier un nouveau trajet avec :
   - Origine : Dakar
   - Destination : Thiès
   - Date : Demain
   - Heure : 14h00
   - Places : 3
   - Prix : 2000 FCFA

**Vérifications :**
- [ ] Notification in-app créée pour le conducteur (type: `ride_created`)
- [ ] Notification push envoyée au conducteur (si token enregistré)
- [ ] Si des alertes correspondent, notifications envoyées aux passagers (type: `alert_match`)
- [ ] Aucune notification en double
- [ ] Logs créés dans `notification_logs`

**Requête SQL de vérification :**
```sql
-- Vérifier les notifications in-app
SELECT * FROM notifications 
WHERE type IN ('ride_created', 'alert_match')
ORDER BY created_at DESC 
LIMIT 10;

-- Vérifier les logs
SELECT * FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

---

#### ✅ SCÉNARIO 2 : Demande de réservation

**Actions :**
1. Créer un compte passager de test
2. Rechercher le trajet publié
3. Faire une demande de réservation (2 places)

**Vérifications :**
- [ ] Notification in-app pour le conducteur (type: `reservation_requested`)
- [ ] Notification push au conducteur
- [ ] Notification in-app pour le passager (statut "En attente")
- [ ] Si départ < 2h ET whatsapp_optin = true : WhatsApp envoyé (en mode test, vérifié dans les logs uniquement)
- [ ] Statut de la réservation = `pending`

**Requête SQL de vérification :**
```sql
-- Vérifier la réservation
SELECT * FROM carpool_bookings 
WHERE status = 'pending'
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'reservation_requested'
ORDER BY created_at DESC 
LIMIT 5;
```

---

#### ✅ SCÉNARIO 3 : Acceptation de réservation

**Actions :**
1. Le conducteur accepte la réservation

**Vérifications :**
- [ ] Notification in-app pour le passager (type: `reservation_accepted`)
- [ ] Notification push au passager
- [ ] Message WhatsApp si trajet proche (en mode test, vérifié dans les logs)
- [ ] Statut de la réservation = `accepted`
- [ ] Places disponibles mises à jour

**Requête SQL de vérification :**
```sql
-- Vérifier l'acceptation
SELECT 
  cb.id,
  cb.status,
  cb.passenger_name,
  cr.seats_available,
  cr.seats_total
FROM carpool_bookings cb
JOIN carpool_rides cr ON cb.ride_id = cr.id
WHERE cb.status = 'accepted'
ORDER BY cb.created_at DESC 
LIMIT 5;

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'reservation_accepted'
ORDER BY created_at DESC 
LIMIT 5;
```

---

#### ✅ SCÉNARIO 4 : Refus de réservation

**Actions :**
1. Créer une nouvelle réservation
2. Le conducteur refuse la réservation

**Vérifications :**
- [ ] Notification in-app pour le passager (type: `reservation_refused`)
- [ ] Notification push au passager
- [ ] Statut de la réservation = `refused`
- [ ] Places disponibles non modifiées

**Requête SQL de vérification :**
```sql
SELECT * FROM carpool_bookings 
WHERE status = 'refused'
ORDER BY created_at DESC 
LIMIT 5;

SELECT * FROM notifications 
WHERE type = 'reservation_refused'
ORDER BY created_at DESC 
LIMIT 5;
```

---

#### ✅ SCÉNARIO 5 : Rappels J-1 et H-1

**Note :** Ces rappels sont déclenchés par un cron job. Pour tester manuellement :

**Test manuel du cron :**
```bash
# Invoquer manuellement la fonction on-ride-reminders
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Vérifications :**
- [ ] Rappel J-1 : Notifications in-app + push pour conducteur et passagers
- [ ] Rappel H-1 : Notifications in-app + push + WhatsApp (logs uniquement en test)
- [ ] Pas de rappels en double
- [ ] Logs créés pour chaque envoi

**Requête SQL de vérification :**
```sql
-- Vérifier les rappels
SELECT * FROM notifications 
WHERE type IN ('reminder_j_minus_1', 'reminder_h_minus_1')
ORDER BY created_at DESC 
LIMIT 10;

-- Vérifier les trajets éligibles pour rappels
SELECT 
  id,
  departure_city,
  arrival_city,
  departure_datetime,
  ride_status
FROM carpool_rides
WHERE departure_datetime BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
  AND ride_status IN ('pending', 'started')
  AND status != 'cancelled';
```

---

#### ✅ SCÉNARIO 6 : "Je suis arrivé"

**Actions :**
1. Le conducteur clique sur "Je suis arrivé"

**Vérifications :**
- [ ] Notifications in-app pour tous les passagers confirmés
- [ ] Notifications push aux passagers
- [ ] WhatsApp envoyé si optin (logs uniquement en test)
- [ ] Message : "Le conducteur est arrivé"

**Requête SQL de vérification :**
```sql
SELECT * FROM notifications 
WHERE type = 'driver_arrived'
ORDER BY created_at DESC 
LIMIT 10;
```

---

#### ✅ SCÉNARIO 7 : Annulation par le conducteur

**Actions :**
1. Le conducteur annule le trajet

**Vérifications :**
- [ ] Notifications in-app pour tous les passagers confirmés
- [ ] Notifications push aux passagers
- [ ] WhatsApp pour annulation urgente (logs uniquement en test)
- [ ] Statut du trajet = `cancelled`
- [ ] Statuts des réservations mis à jour

**Requête SQL de vérification :**
```sql
-- Vérifier l'annulation
SELECT * FROM carpool_rides 
WHERE status = 'cancelled' OR ride_status = 'cancelled'
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_cancelled'
ORDER BY created_at DESC 
LIMIT 10;
```

---

#### ✅ SCÉNARIO 8 : Annulation par le passager

**Actions :**
1. Un passager annule sa réservation

**Vérifications :**
- [ ] Notification in-app pour le conducteur
- [ ] Notification push au conducteur
- [ ] Statut de la réservation = `cancelled_by_passenger`
- [ ] Places disponibles mises à jour

**Requête SQL de vérification :**
```sql
SELECT * FROM carpool_bookings 
WHERE status = 'cancelled_by_passenger'
ORDER BY created_at DESC 
LIMIT 5;

SELECT * FROM notifications 
WHERE type = 'reservation_cancelled_by_passenger'
ORDER BY created_at DESC 
LIMIT 10;
```

---

#### ✅ SCÉNARIO 9 : Fin de trajet

**Actions :**
1. Le conducteur clique sur "Terminer le trajet"

**Vérifications :**
- [ ] Statut du trajet = `ended`
- [ ] Champ `ended_at` rempli
- [ ] Statuts des réservations mis à jour
- [ ] Notifications in-app créées (optionnel)

**Requête SQL de vérification :**
```sql
SELECT 
  id,
  departure_city,
  arrival_city,
  ride_status,
  started_at,
  ended_at,
  duration_actual_minutes
FROM carpool_rides 
WHERE ride_status = 'ended'
ORDER BY ended_at DESC 
LIMIT 5;
```

---

#### ✅ SCÉNARIO 10 : Demande de notation

**Note :** Déclenché par cron job 10-30 min après la fin du trajet.

**Test manuel :**
```bash
# Invoquer manuellement la fonction on-rating-request
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Vérifications :**
- [ ] Notification push au conducteur : "Note tes passagers"
- [ ] Notification push aux passagers : "Note ton conducteur"
- [ ] Notifications in-app créées (type: `rating_request`)
- [ ] Champ `rating_requested_at` rempli dans `carpool_rides`

**Requête SQL de vérification :**
```sql
-- Vérifier les trajets éligibles pour notation
SELECT 
  id,
  departure_city,
  arrival_city,
  ended_at,
  rating_requested_at
FROM carpool_rides 
WHERE ride_status = 'ended'
  AND ended_at BETWEEN NOW() - INTERVAL '30 minutes' AND NOW() - INTERVAL '10 minutes'
  AND rating_requested_at IS NULL;

-- Vérifier les notifications de notation
SELECT * FROM notifications 
WHERE type = 'rating_request'
ORDER BY created_at DESC 
LIMIT 10;
```

---

### 1.3 Checklist de validation globale

Après avoir testé tous les scénarios :

- [ ] Toutes les notifications in-app apparaissent dans la cloche
- [ ] Les statuts se mettent à jour correctement (En attente, Confirmé, Annulé, En cours, Terminé)
- [ ] Aucune notification incohérente ou en double
- [ ] Les logs sont créés pour chaque notification
- [ ] Les erreurs sont correctement loguées
- [ ] Les tokens push invalides sont désactivés

---

## ⏰ ÉTAPE 2 : CONFIGURATION DES CRON JOBS

### 2.1 Configuration du cron pour on-rating-request

**Accéder à Supabase Dashboard :**
1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Naviguer vers **Database** → **Extensions**
3. Activer l'extension `pg_cron` si ce n'est pas déjà fait

**Créer le cron job :**

```sql
-- Exécuter cette migration dans Supabase SQL Editor

-- 1. Activer pg_cron si nécessaire
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Créer le cron job pour on-rating-request
-- S'exécute toutes les 15 minutes
SELECT cron.schedule(
  'rating-request-cron',
  '*/15 * * * *', -- Toutes les 15 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- 3. Vérifier que le cron est créé
SELECT * FROM cron.job WHERE jobname = 'rating-request-cron';
```

**Alternative : Configuration via Supabase Dashboard**

Si vous préférez utiliser l'interface :

1. Aller dans **Database** → **Cron Jobs**
2. Cliquer sur **Create a new cron job**
3. Remplir :
   - **Name:** `rating-request-cron`
   - **Schedule:** `*/15 * * * *` (toutes les 15 minutes)
   - **Command:**
     ```sql
     SELECT
       net.http_post(
         url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
         ),
         body := '{}'::jsonb
       ) AS request_id;
     ```

### 2.2 Configuration du cron pour on-ride-reminders

**Créer le cron job :**

```sql
-- Exécuter cette migration dans Supabase SQL Editor

-- Créer le cron job pour on-ride-reminders
-- S'exécute toutes les 15 minutes
SELECT cron.schedule(
  'ride-reminders-cron',
  '*/15 * * * *', -- Toutes les 15 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Vérifier que le cron est créé
SELECT * FROM cron.job WHERE jobname = 'ride-reminders-cron';
```

### 2.3 Configurer la clé service_role_key

**Important :** Le cron job a besoin de la clé service_role pour invoquer les Edge Functions.

```sql
-- Configurer la clé service_role (à exécuter une seule fois)
-- Remplacer YOUR_SERVICE_ROLE_KEY par votre vraie clé

ALTER DATABASE postgres SET app.settings.service_role_key TO 'YOUR_SERVICE_ROLE_KEY';

-- Recharger la configuration
SELECT pg_reload_conf();
```

**Où trouver la service_role_key :**
1. Supabase Dashboard → **Settings** → **API**
2. Copier la clé **service_role** (⚠️ Ne jamais exposer cette clé côté client)

### 2.4 Vérification des cron jobs

**Lister tous les cron jobs actifs :**

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job
ORDER BY jobname;
```

**Vérifier l'historique d'exécution :**

```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname IN ('rating-request-cron', 'ride-reminders-cron')
)
ORDER BY start_time DESC
LIMIT 20;
```

**Désactiver un cron job (si nécessaire) :**

```sql
-- Désactiver temporairement
SELECT cron.unschedule('rating-request-cron');

-- Réactiver
SELECT cron.schedule(
  'rating-request-cron',
  '*/15 * * * *',
  $$ ... $$
);
```

### 2.5 Tests des cron jobs

**Test 1 : Invocation manuelle**

```bash
# Tester on-rating-request
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'

# Tester on-ride-reminders
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

**Test 2 : Créer un trajet de test**

```sql
-- Créer un trajet qui s'est terminé il y a 15 minutes
INSERT INTO carpool_rides (
  driver_id,
  driver_name,
  driver_phone,
  departure_city,
  arrival_city,
  departure_datetime,
  seats_total,
  seats_available,
  price_per_seat,
  ride_status,
  ended_at
) VALUES (
  'test-user-id',
  'Test Driver',
  '+221771234567',
  'Dakar',
  'Thiès',
  NOW() - INTERVAL '2 hours',
  3,
  1,
  2000,
  'ended',
  NOW() - INTERVAL '15 minutes'
);

-- Attendre 15 minutes et vérifier que la notification est envoyée
```

**Checklist de validation :**

- [ ] Les cron jobs sont créés et actifs
- [ ] La service_role_key est configurée
- [ ] L'historique d'exécution montre des succès
- [ ] Les notifications sont envoyées aux bons moments
- [ ] Pas d'erreurs dans les logs

---

## 🔧 ÉTAPE 3 : VÉRIFICATION IS_PRODUCTION_MODE

### 3.1 Vérifier la configuration dans les Edge Functions

**Lister tous les secrets Supabase :**

```bash
supabase secrets list
```

**Vérifier IS_PRODUCTION_MODE :**

```bash
# Doit afficher "false" en test, "true" en production
supabase secrets get IS_PRODUCTION_MODE
```

**Mettre à jour IS_PRODUCTION_MODE :**

```bash
# Pour le mode test
supabase secrets set IS_PRODUCTION_MODE=false

# Pour le mode production
supabase secrets set IS_PRODUCTION_MODE=true
```

### 3.2 Comportement attendu par mode

#### 🧪 MODE TEST (IS_PRODUCTION_MODE = false)

**Notifications in-app :**
- ✅ Envoyées normalement
- ✅ Créées dans la table `notifications`
- ✅ Visibles dans la cloche

**Notifications push :**
- ⚠️ **DÉSACTIVÉES** (skipped)
- 📝 Loguées avec status "Test mode - push skipped"
- 💡 Permet de tester sans spammer les utilisateurs

**Messages WhatsApp :**
- ⚠️ **DÉSACTIVÉS** (skipped)
- 📝 Loguées avec status "Test mode - WhatsApp skipped"
- 💡 Évite les coûts Twilio en test

**Logs :**
```sql
-- Vérifier les logs en mode test
SELECT 
  channel,
  status,
  error_message,
  created_at
FROM notification_logs
WHERE error_message LIKE '%Test mode%'
ORDER BY created_at DESC
LIMIT 20;
```

#### 🚀 MODE PRODUCTION (IS_PRODUCTION_MODE = true)

**Notifications in-app :**
- ✅ Envoyées normalement

**Notifications push :**
- ✅ **ACTIVÉES**
- 📤 Envoyées via Expo/FCM
- 📱 Reçues sur les téléphones

**Messages WhatsApp :**
- ✅ **ACTIVÉS** (si whatsapp_optin = true)
- 📤 Envoyés via Twilio
- 💰 Coûts Twilio appliqués

### 3.3 Vérifier la lecture de IS_PRODUCTION_MODE dans les Edge Functions

**Fonctions à vérifier :**

1. ✅ `send-notification-unified` - Fonction principale
2. ✅ `on-ride-created`
3. ✅ `on-reservation-requested`
4. ✅ `on-reservation-status-changed`
5. ✅ `on-ride-reminders`
6. ✅ `on-driver-arrived`
7. ✅ `on-ride-status-changed`
8. ✅ `on-rating-request`

**Toutes ces fonctions utilisent `send-notification-unified` qui lit IS_PRODUCTION_MODE.**

**Test de vérification :**

```bash
# Invoquer une fonction et vérifier la réponse
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "test",
    "userId": "test-user-id",
    "title": "Test",
    "message": "Test message",
    "channels": ["in_app", "push", "whatsapp"]
  }'

# La réponse doit contenir :
# {
#   "success": true,
#   "mode": "test" ou "production",
#   "channels": {
#     "in_app": { "success": true },
#     "push": { "success": false, "error": "Test mode - push skipped" },
#     "whatsapp": { "success": false, "error": "Test mode - WhatsApp skipped" }
#   }
# }
```

### 3.4 Checklist de validation

- [ ] IS_PRODUCTION_MODE est configuré dans les secrets Supabase
- [ ] En mode test : push et WhatsApp sont désactivés
- [ ] En mode test : in-app fonctionne normalement
- [ ] En mode production : tous les canaux sont activés
- [ ] Les logs indiquent clairement le mode utilisé
- [ ] La réponse des Edge Functions contient le champ `mode`

---

## 🧑‍🔬 ÉTAPE 4 : TESTS EN PRODUCTION (PILOTE)

### 4.1 Préparation du groupe pilote

**Créer des comptes de test internes :**

1. **Conducteur pilote :**
   - Nom : Test Conducteur
   - Téléphone : +221771111111
   - whatsapp_optin : true
   - Enregistrer un token push (iOS + Android)

2. **Passager pilote 1 :**
   - Nom : Test Passager 1
   - Téléphone : +221772222222
   - whatsapp_optin : true
   - Enregistrer un token push (iOS + Android)

3. **Passager pilote 2 :**
   - Nom : Test Passager 2
   - Téléphone : +221773333333
   - whatsapp_optin : false (pour tester sans WhatsApp)
   - Enregistrer un token push (iOS + Android)

**Enregistrer les tokens push :**

```sql
-- Insérer les tokens de test
INSERT INTO device_tokens (user_id, expo_push_token, platform, active)
VALUES 
  ('conducteur-pilote-id', 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', 'ios', true),
  ('passager-1-id', 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]', 'android', true),
  ('passager-2-id', 'ExponentPushToken[zzzzzzzzzzzzzzzzzzzzzz]', 'ios', true);
```

### 4.2 Activer le mode production

```bash
# Activer le mode production
supabase secrets set IS_PRODUCTION_MODE=true

# Vérifier
supabase secrets get IS_PRODUCTION_MODE
# Doit afficher : true
```

### 4.3 Scénarios de test en production

#### 🧪 TEST 1 : Push notifications (iOS + Android)

**Actions :**
1. Le conducteur pilote publie un trajet
2. Le passager 1 fait une demande de réservation
3. Le conducteur accepte

**Vérifications :**
- [ ] Push reçu sur iPhone du conducteur
- [ ] Push reçu sur Android du passager 1
- [ ] Pas de doublons
- [ ] Contenu correct (titre, message, métadonnées)
- [ ] Son et vibration fonctionnent
- [ ] Clic sur la notification ouvre l'app

**Logs à vérifier :**
```sql
SELECT 
  channel,
  status,
  payload->>'title' as title,
  payload->>'message' as message,
  error_message,
  created_at
FROM notification_logs
WHERE channel = 'push'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

---

#### 🧪 TEST 2 : Messages WhatsApp (Twilio)

**Actions :**
1. Créer un trajet qui part dans 30 minutes
2. Le passager 1 (whatsapp_optin = true) fait une réservation
3. Le conducteur accepte

**Vérifications :**
- [ ] Message WhatsApp reçu par le passager 1
- [ ] Pas de message pour le passager 2 (whatsapp_optin = false)
- [ ] Contenu du message correct
- [ ] Pas de doublons
- [ ] Numéro de téléphone formaté correctement (+221...)

**Logs à vérifier :**
```sql
SELECT 
  channel,
  status,
  payload->>'phoneNumber' as phone,
  payload->>'message' as message,
  error_message,
  created_at
FROM notification_logs
WHERE channel = 'whatsapp'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

**Vérifier dans Twilio Console :**
1. Aller sur https://console.twilio.com
2. Naviguer vers **Messaging** → **Logs**
3. Vérifier que les messages sont envoyés avec succès

---

#### 🧪 TEST 3 : Rappels J-1 et H-1

**Actions :**
1. Créer un trajet pour demain à 14h00
2. Attendre que le cron J-1 s'exécute (ou invoquer manuellement)
3. Le lendemain, attendre le cron H-1 (ou invoquer manuellement)

**Vérifications :**
- [ ] Rappel J-1 : Push reçu par conducteur et passagers
- [ ] Rappel H-1 : Push + WhatsApp reçus
- [ ] Pas de rappels en double
- [ ] Horaires corrects dans les messages

---

#### 🧪 TEST 4 : Demande de notation

**Actions :**
1. Créer un trajet et le terminer
2. Attendre 15-20 minutes
3. Le cron on-rating-request s'exécute

**Vérifications :**
- [ ] Push reçu par le conducteur : "Note tes passagers"
- [ ] Push reçu par les passagers : "Note ton conducteur"
- [ ] Notifications in-app créées
- [ ] Pas de doublons

---

### 4.4 Checklist de validation production

- [ ] Push notifications reçues sur iOS
- [ ] Push notifications reçues sur Android
- [ ] Messages WhatsApp reçus (si optin)
- [ ] Pas de messages WhatsApp si pas d'optin
- [ ] Pas de doublons (ni push, ni WhatsApp)
- [ ] Contenu des messages correct
- [ ] Variables remplacées correctement (nom, ville, heure)
- [ ] Clic sur notification ouvre l'app
- [ ] Logs Twilio montrent des succès
- [ ] Logs Supabase montrent des succès

---

## 📊 ÉTAPE 5 : SURVEILLANCE DES LOGS

### 5.1 Monitoring des notification_logs

**Requête de surveillance générale :**

```sql
-- Vue d'ensemble des notifications des dernières 24h
SELECT 
  channel,
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success_count,
  COUNT(*) FILTER (WHERE status = 'error') as error_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, status
ORDER BY channel, status;
```

**Requête pour détecter les erreurs récurrentes :**

```sql
-- Top 10 des erreurs les plus fréquentes
SELECT 
  channel,
  error_message,
  COUNT(*) as occurrences,
  MAX(created_at) as last_occurrence
FROM notification_logs
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, error_message
ORDER BY occurrences DESC
LIMIT 10;
```

**Requête pour surveiller les tokens push invalides :**

```sql
-- Tokens désactivés récemment
SELECT 
  dt.id,
  dt.user_id,
  dt.platform,
  dt.expo_push_token,
  dt.active,
  dt.last_used_at,
  up.full_name,
  up.phone_number
FROM device_tokens dt
JOIN user_profiles up ON dt.user_id = up.id
WHERE dt.active = false
  AND dt.updated_at > NOW() - INTERVAL '24 hours'
ORDER BY dt.updated_at DESC;
```

### 5.2 Monitoring des Edge Functions

**Accéder aux logs Supabase :**

1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Naviguer vers **Edge Functions** → **Logs**
3. Filtrer par fonction :
   - `send-notification-unified`
   - `on-ride-reminders`
   - `on-rating-request`

**Logs à surveiller :**

- ❌ Erreurs 500 (Internal Server Error)
- ⏱️ Timeouts (> 30 secondes)
- 🔑 Erreurs d'authentification Twilio
- 📱 Erreurs Expo/FCM (DeviceNotRegistered, InvalidToken)

**Requête pour surveiller les performances :**

```sql
-- Temps de réponse moyen par canal
SELECT 
  channel,
  AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) as avg_response_time_seconds,
  COUNT(*) as total_notifications
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY channel
ORDER BY channel;
```

### 5.3 Monitoring Twilio

**Accéder à Twilio Console :**

1. Aller sur https://console.twilio.com
2. Naviguer vers **Messaging** → **Logs**

**Métriques à surveiller :**

- 📊 Taux de livraison (Delivered / Sent)
- ❌ Messages échoués (Failed)
- 💰 Coûts par message
- ⏱️ Temps de livraison moyen

**Erreurs Twilio courantes :**

| Code | Description | Solution |
|------|-------------|----------|
| 21211 | Invalid 'To' Phone Number | Vérifier le format E.164 (+221...) |
| 21408 | Permission to send an SMS has not been enabled | Activer WhatsApp dans Twilio |
| 21610 | Attempt to send to unsubscribed recipient | Utilisateur a bloqué les messages |
| 30007 | Message Delivery - Carrier Violation | Contenu du message bloqué par l'opérateur |

### 5.4 Alertes et seuils critiques

**Définir des seuils d'alerte :**

```sql
-- Créer une vue pour les métriques critiques
CREATE OR REPLACE VIEW notification_health_metrics AS
SELECT 
  channel,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour_total,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') as last_hour_errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') / 
        NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour'), 0), 2) as error_rate_percent
FROM notification_logs
GROUP BY channel;

-- Vérifier les métriques
SELECT * FROM notification_health_metrics;
```

**Seuils d'alerte recommandés :**

- 🟢 **Normal :** Taux d'erreur < 5%
- 🟡 **Attention :** Taux d'erreur 5-15%
- 🔴 **Critique :** Taux d'erreur > 15%

**Requête d'alerte automatique :**

```sql
-- Détecter les problèmes critiques
SELECT 
  channel,
  error_rate_percent,
  last_hour_errors,
  last_hour_total,
  CASE 
    WHEN error_rate_percent > 15 THEN '🔴 CRITIQUE'
    WHEN error_rate_percent > 5 THEN '🟡 ATTENTION'
    ELSE '🟢 NORMAL'
  END as status
FROM notification_health_metrics
WHERE error_rate_percent > 5
ORDER BY error_rate_percent DESC;
```

### 5.5 Actions correctives

**Si taux d'erreur push > 15% :**

1. Vérifier les tokens push :
   ```sql
   -- Désactiver les tokens non utilisés depuis 30 jours
   UPDATE device_tokens
   SET active = false
   WHERE last_used_at < NOW() - INTERVAL '30 days'
     AND active = true;
   ```

2. Vérifier la configuration Expo/FCM
3. Vérifier les logs Edge Functions

**Si taux d'erreur WhatsApp > 15% :**

1. Vérifier les crédits Twilio
2. Vérifier le format des numéros de téléphone
3. Vérifier les logs Twilio Console
4. Vérifier que TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN sont corrects

**Si timeouts fréquents :**

1. Optimiser les requêtes SQL dans les Edge Functions
2. Ajouter des index sur les tables
3. Réduire le nombre de notifications envoyées en parallèle

### 5.6 Dashboard de monitoring (optionnel)

**Créer une vue pour un dashboard simple :**

```sql
-- Vue dashboard : statistiques des dernières 24h
CREATE OR REPLACE VIEW notification_dashboard AS
SELECT 
  'Dernières 24h' as periode,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE channel = 'in_app') as in_app_total,
  COUNT(*) FILTER (WHERE channel = 'push') as push_total,
  COUNT(*) FILTER (WHERE channel = 'whatsapp') as whatsapp_total,
  COUNT(*) FILTER (WHERE status = 'success') as success_total,
  COUNT(*) FILTER (WHERE status = 'error') as error_total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / NULLIF(COUNT(*), 0), 2) as success_rate
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Consulter le dashboard
SELECT * FROM notification_dashboard;
```

---

## ✅ CHECKLIST FINALE

### Phase 1 : Tests en développement

- [ ] Tous les scénarios de notification testés
- [ ] Notifications in-app fonctionnent
- [ ] Statuts se mettent à jour correctement
- [ ] Aucune notification en double
- [ ] Logs créés pour chaque notification

### Phase 2 : Configuration cron jobs

- [ ] Extension pg_cron activée
- [ ] Cron job `rating-request-cron` créé et actif
- [ ] Cron job `ride-reminders-cron` créé et actif
- [ ] Service_role_key configurée
- [ ] Tests manuels des cron jobs réussis

### Phase 3 : Vérification IS_PRODUCTION_MODE

- [ ] IS_PRODUCTION_MODE configuré dans les secrets
- [ ] Mode test : push et WhatsApp désactivés
- [ ] Mode production : tous les canaux activés
- [ ] Logs indiquent le mode utilisé

### Phase 4 : Tests en production (pilote)

- [ ] Groupe pilote créé (conducteur + 2 passagers)
- [ ] Push notifications testées sur iOS
- [ ] Push notifications testées sur Android
- [ ] Messages WhatsApp testés
- [ ] Rappels J-1 et H-1 testés
- [ ] Demande de notation testée
- [ ] Pas de doublons détectés
- [ ] Contenu des messages correct

### Phase 5 : Surveillance des logs

- [ ] Requêtes de monitoring créées
- [ ] Seuils d'alerte définis
- [ ] Logs Supabase surveillés
- [ ] Logs Twilio surveillés
- [ ] Dashboard de monitoring créé (optionnel)
- [ ] Actions correctives documentées

---

## 🚀 DÉPLOIEMENT EN PRODUCTION

Une fois toutes les étapes validées :

1. **Activer le mode production :**
   ```bash
   supabase secrets set IS_PRODUCTION_MODE=true
   ```

2. **Communiquer aux utilisateurs :**
   - Informer de l'activation des notifications
   - Expliquer comment activer/désactiver les notifications push
   - Expliquer l'opt-in WhatsApp

3. **Surveiller pendant 48h :**
   - Vérifier les logs toutes les 4h
   - Réagir rapidement aux erreurs
   - Ajuster les seuils d'alerte si nécessaire

4. **Optimiser si nécessaire :**
   - Ajuster la fréquence des cron jobs
   - Optimiser les requêtes SQL
   - Améliorer les messages

---

## 📞 SUPPORT ET DÉPANNAGE

### Problèmes courants

**1. Notifications push non reçues**
- Vérifier que le token est enregistré dans `device_tokens`
- Vérifier que `active = true`
- Vérifier les permissions de l'app sur le téléphone
- Vérifier les logs Expo

**2. Messages WhatsApp non reçus**
- Vérifier `whatsapp_optin = true`
- Vérifier le format du numéro (+221...)
- Vérifier les crédits Twilio
- Vérifier les logs Twilio Console

**3. Cron jobs ne s'exécutent pas**
- Vérifier que pg_cron est activé
- Vérifier que service_role_key est configurée
- Vérifier l'historique d'exécution dans `cron.job_run_details`

**4. Notifications en double**
- Vérifier qu'il n'y a pas de triggers en double
- Vérifier les logs pour identifier la source
- Ajouter des contraintes d'unicité si nécessaire

---

## 📚 RESSOURCES

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentation Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Documentation Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Documentation pg_cron](https://github.com/citusdata/pg_cron)

---

**Dernière mise à jour :** 2025-01-31
**Version :** 1.0
**Auteur :** Équipe Yombal Yoon
