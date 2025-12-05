
# 🧪 Guide de Test Rapide - Notifications Partie 1

## Prérequis

1. ✅ `IS_PRODUCTION_MODE` configuré dans Supabase Secrets
2. ✅ Twilio configuré (ACCOUNT_SID, AUTH_TOKEN, WHATSAPP_FROM)
3. ✅ `app_config` table remplie (supabase_url, service_role_key)
4. ✅ Extension `pg_net` activée
5. ✅ Extension `pg_cron` activée
6. ✅ Cron jobs créés (ride-reminders, rating-requests)

---

## Test 1: Publication de Trajet (1.1)

### Étapes:
1. Ouvrir l'app Yombal Yoon
2. Aller dans "Covoiturage" → "Publier un trajet"
3. Remplir le formulaire:
   - Départ: Dakar
   - Arrivée: Kaolack
   - Date: Demain
   - Heure: 14:00
   - Places: 3
   - Prix: 5000 FCFA
4. Cliquer sur "Publier"

### Résultats Attendus:
- ✅ Trajet créé dans `carpool_rides`
- ✅ Notification in-app conducteur: "Ton trajet Dakar → Kaolack du [date] à 14:00 est en ligne ✅"
- ✅ Notification push conducteur (si mode production)
- ✅ Si alerte correspondante existe: notification passager

### Vérification SQL:
```sql
-- Vérifier le trajet créé
SELECT * FROM carpool_rides ORDER BY created_at DESC LIMIT 1;

-- Vérifier les notifications in-app
SELECT * FROM notifications WHERE type = 'ride_published' ORDER BY created_at DESC LIMIT 5;

-- Vérifier les logs de notification
SELECT * FROM notification_logs WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC;
```

---

## Test 2: Demande de Réservation (1.2)

### Étapes:
1. Ouvrir l'app avec un autre compte (passager)
2. Aller dans "Covoiturage" → "Rechercher un trajet"
3. Rechercher le trajet créé (Dakar → Kaolack)
4. Cliquer sur "Réserver"
5. Choisir 1 passager
6. Confirmer la réservation

### Résultats Attendus:

**Conducteur:**
- ✅ Notification in-app: "Nouvelle demande 🚗 : [Nom] souhaite une place"
- ✅ Notification push (si mode production)
- ✅ WhatsApp si départ < 2h (si mode production)

**Passager:**
- ✅ Notification in-app: "Demande envoyée ! En attente de validation."

### Vérification SQL:
```sql
-- Vérifier la réservation créée
SELECT * FROM carpool_bookings ORDER BY created_at DESC LIMIT 1;

-- Vérifier les notifications
SELECT * FROM notifications WHERE type = 'reservation_requested' ORDER BY created_at DESC LIMIT 5;

-- Vérifier les logs
SELECT * FROM notification_logs WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC;
```

---

## Test 3: Acceptation de Réservation (1.3)

### Étapes:
1. Ouvrir l'app avec le compte conducteur
2. Aller dans "Mes trajets publiés"
3. Voir la demande de réservation en attente
4. Cliquer sur "Accepter"

### Résultats Attendus:

**Passager:**
- ✅ Notification in-app: "[Conducteur] a accepté ta demande 🎉"
- ✅ Notification push (si mode production)
- ✅ WhatsApp si départ < 4h (si mode production)

**Conducteur:**
- ✅ Liste des passagers mise à jour

### Vérification SQL:
```sql
-- Vérifier le statut de la réservation
SELECT * FROM carpool_bookings WHERE status = 'accepted' ORDER BY updated_at DESC LIMIT 1;

-- Vérifier les notifications
SELECT * FROM notifications WHERE type = 'reservation_accepted' ORDER BY created_at DESC LIMIT 5;

-- Vérifier les logs
SELECT * FROM notification_logs WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC;
```

---

## Test 4: Refus de Réservation (1.4)

### Étapes:
1. Créer une nouvelle réservation
2. Ouvrir l'app avec le compte conducteur
3. Aller dans "Mes trajets publiés"
4. Cliquer sur "Refuser"

### Résultats Attendus:

**Passager:**
- ✅ Notification in-app: "[Conducteur] n'a pas accepté ta demande."
- ✅ Notification push (si mode production)

### Vérification SQL:
```sql
-- Vérifier le statut de la réservation
SELECT * FROM carpool_bookings WHERE status = 'refused' ORDER BY updated_at DESC LIMIT 1;

-- Vérifier les notifications
SELECT * FROM notifications WHERE type = 'reservation_refused' ORDER BY created_at DESC LIMIT 5;
```

---

## Test 5: Rappel J-1 (2.1)

### Étapes:
1. Créer un trajet pour **demain** à 14:00
2. Accepter une réservation
3. Attendre **maximum 10 minutes** (cron job)

### Résultats Attendus:

**Conducteur:**
- ✅ Notification in-app: "Tu conduis demain Dakar → Kaolack à 14:00"
- ✅ Notification push (si mode production)

**Passager:**
- ✅ Notification in-app: "Rappel : Trajet demain Dakar → Kaolack à 14:00"
- ✅ Notification push (si mode production)

### Vérification SQL:
```sql
-- Vérifier les notifications de rappel
SELECT * FROM notifications WHERE type = 'reminder_j_minus_1' ORDER BY created_at DESC LIMIT 10;

-- Vérifier les logs
SELECT * FROM notification_logs WHERE payload->>'type' = 'reminder_j_minus_1' ORDER BY created_at DESC;

-- Vérifier l'exécution du cron
SELECT * FROM cron.job_run_details WHERE jobid = 1 ORDER BY start_time DESC LIMIT 5;
```

---

## Test 6: Rappel H-1 (2.2)

### Étapes:
1. Créer un trajet pour **dans 1 heure**
2. Accepter une réservation
3. Attendre **maximum 10 minutes** (cron job)

### Résultats Attendus:

**Conducteur:**
- ✅ Notification in-app: "Ton trajet démarre dans 1h"
- ✅ Notification push (si mode production)
- ✅ WhatsApp: "Votre trajet commence dans 1 heure." (si mode production)

**Passager:**
- ✅ Notification in-app: "Ton trajet démarre dans 1h. Sois à l'heure 📍"
- ✅ Notification push (si mode production)
- ✅ WhatsApp: "Votre trajet commence dans 1 heure. Soyez à l'heure 📍" (si mode production)

### Vérification SQL:
```sql
-- Vérifier les notifications de rappel
SELECT * FROM notifications WHERE type = 'reminder_h_minus_1' ORDER BY created_at DESC LIMIT 10;

-- Vérifier les logs WhatsApp
SELECT * FROM notification_logs WHERE channel = 'whatsapp' AND payload->>'type' = 'reminder_h_minus_1' ORDER BY created_at DESC;
```

---

## Test 7: Arrivée Conducteur (2.3)

### Étapes:
1. Ouvrir l'app avec le compte conducteur
2. Aller dans "Mes trajets publiés"
3. Cliquer sur le bouton **"Je suis arrivé"**
4. Confirmer

### Résultats Attendus:

**Passagers:**
- ✅ Notification in-app: "[Conducteur] est arrivé 📍 Rendez-vous au point de rencontre."
- ✅ Notification push (si mode production)
- ✅ WhatsApp: "Le conducteur est arrivé. Rejoignez-le dans les 5 minutes." (si mode production)

### Vérification SQL:
```sql
-- Vérifier les notifications d'arrivée
SELECT * FROM notifications WHERE type = 'driver_arrived' ORDER BY created_at DESC LIMIT 10;

-- Vérifier les logs
SELECT * FROM notification_logs WHERE payload->>'type' = 'driver_arrived' ORDER BY created_at DESC;
```

---

## Vérifications Globales

### 1. Vérifier les Edge Functions

```bash
# Dans le Dashboard Supabase → Edge Functions
# Vérifier que toutes les fonctions sont "Active"
# Consulter les logs pour chaque fonction
```

### 2. Vérifier les Triggers

```sql
-- Lister tous les triggers
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('carpool_rides', 'carpool_bookings')
ORDER BY event_object_table, trigger_name;
```

### 3. Vérifier les Cron Jobs

```sql
-- Lister les cron jobs
SELECT * FROM cron.job WHERE active = true;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

### 4. Vérifier les Logs de Notification

```sql
-- Statistiques des dernières 24h
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, status
ORDER BY channel, status;

-- Dernières erreurs
SELECT * FROM notification_logs 
WHERE status = 'error' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Checklist de Test Complet

- [ ] Test 1: Publication de trajet ✅
- [ ] Test 2: Demande de réservation ✅
- [ ] Test 3: Acceptation de réservation ✅
- [ ] Test 4: Refus de réservation ✅
- [ ] Test 5: Rappel J-1 ✅
- [ ] Test 6: Rappel H-1 ✅
- [ ] Test 7: Arrivée conducteur ✅
- [ ] Vérification Edge Functions ✅
- [ ] Vérification Triggers ✅
- [ ] Vérification Cron Jobs ✅
- [ ] Vérification Logs ✅

---

## Dépannage Rapide

### Problème: Pas de notification in-app
```sql
-- Vérifier si la notification a été créée
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Vérifier les logs
SELECT * FROM notification_logs WHERE channel = 'in_app' ORDER BY created_at DESC LIMIT 10;
```

### Problème: Pas de notification push
```sql
-- Vérifier les tokens actifs
SELECT * FROM device_tokens WHERE active = true;

-- Vérifier IS_PRODUCTION_MODE
-- Dans Supabase Dashboard → Settings → Edge Functions → Secrets
```

### Problème: Pas de WhatsApp
```sql
-- Vérifier l'opt-in
SELECT id, phone_number, whatsapp_optin FROM user_profiles;

-- Vérifier les logs WhatsApp
SELECT * FROM notification_logs WHERE channel = 'whatsapp' ORDER BY created_at DESC LIMIT 10;

-- Vérifier les secrets Twilio
-- Dans Supabase Dashboard → Settings → Edge Functions → Secrets
```

### Problème: Trigger ne se déclenche pas
```sql
-- Vérifier app_config
SELECT * FROM app_config;

-- Vérifier les logs Postgres
-- Dans Supabase Dashboard → Database → Logs
```

---

**Temps estimé pour tous les tests:** 30-45 minutes

**Note:** Pour les tests de cron (J-1, H-1), vous pouvez aussi appeler manuellement l'Edge Function:

```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders \
  -H "Content-Type: application/json" \
  -d '{}'
```
