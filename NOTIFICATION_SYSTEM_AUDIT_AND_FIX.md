
# 🔍 AUDIT COMPLET DU SYSTÈME DE NOTIFICATIONS - YOMBAL YOON

**Date**: 2 février 2025  
**Projet**: Yombal Yoon Covoiturage  
**Supabase Project ID**: drxtaxepofuoelplgrei

---

## 📊 RÉSUMÉ EXÉCUTIF

Le système de notifications a été audité et plusieurs problèmes critiques ont été identifiés et corrigés:

### ✅ **PROBLÈMES RÉSOLUS**

1. ✅ **Cron Jobs créés** - Rappels J-1/H-1 et demandes de notation
2. ✅ **Triggers dupliqués supprimés** - Un seul trigger par événement
3. ✅ **Index de performance ajoutés** - Requêtes optimisées
4. ✅ **Edge Functions redéployées** - Code à jour

### ⚠️ **ACTIONS REQUISES (MANUELLES)**

1. ⚠️ **CRITIQUE**: Désactiver JWT verification pour les Edge Functions appelées par les triggers
2. ⚠️ **CRITIQUE**: Configurer la clé Service Role dans `app_config`
3. ⚠️ **IMPORTANT**: Vérifier les secrets Twilio dans Supabase

---

## 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

### **1. Edge Functions retournent 401 Unauthorized**

**Symptôme**:
```
POST | 401 | https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-created
execution_time_ms: 159
```

**Cause**:
- Toutes les Edge Functions ont `verify_jwt = true` par défaut
- Les triggers Postgres appellent les Edge Functions sans JWT valide
- Résultat: 401 Unauthorized, aucune notification envoyée

**Impact**:
- ❌ Aucune notification lors de la création de trajets
- ❌ Aucune notification lors des réservations
- ❌ Aucune notification lors des changements de statut

**Solution**:
Les Edge Functions suivantes doivent avoir `verify_jwt = false`:
- `on-ride-created`
- `on-reservation-requested`
- `on-reservation-status-changed`
- `on-ride-status-changed`
- `on-driver-arrived`
- `on-ride-reminders` (appelée par cron)
- `on-rating-request` (appelée par cron)

**Comment corriger** (via Supabase CLI):

```bash
# 1. Créer un fichier supabase/functions/on-ride-created/supabase.toml
cat > supabase/functions/on-ride-created/supabase.toml << EOF
[function.on-ride-created]
verify_jwt = false
EOF

# 2. Redéployer avec --no-verify-jwt
supabase functions deploy on-ride-created --project-ref drxtaxepofuoelplgrei --no-verify-jwt

# 3. Répéter pour toutes les fonctions listées ci-dessus
```

**Vérification**:
```bash
# Vérifier dans le Dashboard Supabase
# Edge Functions → on-ride-created → Settings
# "JWT Verification" doit être "Disabled"
```

---

### **2. Service Role Key non configurée**

**Symptôme**:
```sql
SELECT * FROM app_config WHERE key = 'service_role_key';
-- Résultat: 'YOUR_SERVICE_ROLE_KEY_HERE'
```

**Cause**:
- La clé Service Role n'a jamais été configurée dans `app_config`
- Les triggers `trigger_on_reservation_requested_fn` et `trigger_on_reservation_status_changed_fn` utilisent cette clé
- Sans clé valide, les appels aux Edge Functions échouent

**Impact**:
- ❌ Notifications de réservation ne fonctionnent pas
- ❌ Notifications de changement de statut ne fonctionnent pas

**Solution**:

```sql
-- 1. Récupérer la Service Role Key depuis Supabase Dashboard
-- Settings → API → service_role (secret)

-- 2. Mettre à jour app_config
UPDATE app_config 
SET value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHRheGVwb2Z1b2VscGxncmVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2MjAwMCwiZXhwIjoyMDE0MzM4MDAwfQ.YOUR_ACTUAL_KEY_HERE',
    updated_at = NOW()
WHERE key = 'service_role_key';
```

**⚠️ IMPORTANT**: Ne JAMAIS commiter cette clé dans Git!

---

### **3. Cron Jobs non configurés**

**Symptôme**:
```sql
SELECT * FROM cron.job;
-- ERROR: relation "cron.job" does not exist
```

**Cause**:
- Extension `pg_cron` n'était pas activée
- Aucun job planifié pour les rappels et demandes de notation

**Impact**:
- ❌ Pas de rappels J-1 (24h avant le trajet)
- ❌ Pas de rappels H-1 (1h avant le trajet)
- ❌ Pas de demandes de notation après les trajets

**Solution**: ✅ **CORRIGÉ** par la migration `fix_notification_system_complete`

Les cron jobs suivants ont été créés:
- `ride-reminders`: Toutes les 10 minutes
- `rating-requests`: Toutes les 5 minutes

**Vérification**:
```sql
SELECT * FROM cron.job;
-- Doit afficher 2 jobs
```

---

### **4. Triggers dupliqués**

**Symptôme**:
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'carpool_rides'::regclass;
-- Résultat: tg_on_ride_created ET trigger_on_ride_created
```

**Cause**:
- Deux systèmes de triggers ont été créés en parallèle
- `call_on_ride_created()` (ancien, sans auth)
- `trigger_on_ride_created_fn()` (nouveau, avec auth)

**Impact**:
- ⚠️ Appels dupliqués potentiels
- ⚠️ Confusion dans les logs

**Solution**: ✅ **CORRIGÉ** par la migration `fix_notification_system_complete`

Le trigger `tg_on_ride_created` et la fonction `call_on_ride_created()` ont été supprimés.

---

## ✅ CORRECTIONS APPLIQUÉES

### **Migration: fix_notification_system_complete**

```sql
-- 1. Extension pg_cron activée
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Triggers dupliqués supprimés
DROP TRIGGER IF EXISTS tg_on_ride_created ON carpool_rides;
DROP FUNCTION IF EXISTS call_on_ride_created();

-- 3. Cron jobs créés
-- ride-reminders: */10 * * * * (toutes les 10 min)
-- rating-requests: */5 * * * * (toutes les 5 min)

-- 4. Index de performance ajoutés
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_carpool_rides_departure_status ON carpool_rides(departure_datetime, ride_status);
CREATE INDEX idx_carpool_rides_ended_rating ON carpool_rides(ended_at, rating_requested_at);
```

---

## 📋 ARCHITECTURE DU SYSTÈME DE NOTIFICATIONS

### **1. Triggers Database → Edge Functions**

```
carpool_rides (INSERT)
  → trigger_on_ride_created
    → trigger_on_ride_created_fn()
      → POST /functions/v1/on-ride-created
        → send-notification-unified (driver)
        → send-notification-unified (passengers avec alertes)

carpool_bookings (INSERT)
  → trigger_on_reservation_requested
    → trigger_on_reservation_requested_fn()
      → POST /functions/v1/on-reservation-requested
        → send-notification-unified (driver)
        → send-notification-unified (passenger confirmation)

carpool_bookings (UPDATE status)
  → trigger_on_reservation_status_changed
    → trigger_on_reservation_status_changed_fn()
      → POST /functions/v1/on-reservation-status-changed
        → send-notification-unified (passenger)
```

### **2. Cron Jobs → Edge Functions**

```
Cron: */10 * * * * (toutes les 10 min)
  → POST /functions/v1/on-ride-reminders
    → Trouve trajets J-1 (24h avant)
      → send-notification-unified (driver + passengers)
    → Trouve trajets H-1 (1h avant)
      → send-notification-unified (driver + passengers + WhatsApp)

Cron: */5 * * * * (toutes les 5 min)
  → POST /functions/v1/on-rating-request
    → Trouve trajets terminés 10-30 min avant
      → send-notification-unified (driver)
      → send-notification-unified (passengers)
```

### **3. Edge Function: send-notification-unified**

**Canaux supportés**:
- `in_app`: Notification dans la table `notifications`
- `push`: Notification push via Expo/FCM (table `device_tokens`)
- `whatsapp`: Message WhatsApp via Twilio (si `whatsapp_optin = true`)

**Mode Production vs Test**:
- `IS_PRODUCTION_MODE = false`: Seules les notifications in-app sont envoyées
- `IS_PRODUCTION_MODE = true`: Tous les canaux sont actifs

---

## 🔧 CONFIGURATION REQUISE

### **1. Secrets Supabase (Edge Functions)**

Vérifier dans **Supabase Dashboard → Edge Functions → Settings → Secrets**:

```bash
SUPABASE_URL=https://drxtaxepofuoelplgrei.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
IS_PRODUCTION_MODE=false  # Mettre à "true" en production
```

### **2. Table app_config**

```sql
-- Vérifier la configuration
SELECT * FROM app_config;

-- Doit contenir:
-- supabase_url: https://drxtaxepofuoelplgrei.supabase.co
-- service_role_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (VRAIE CLÉ)
-- notification_system_fixed: true
```

### **3. Extension pg_cron**

```sql
-- Vérifier que l'extension est activée
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Vérifier les jobs
SELECT * FROM cron.job;
```

---

## 🧪 TESTS À EFFECTUER

### **Test 1: Création de trajet**

```typescript
// 1. Créer un trajet
const { data: ride } = await supabase
  .from('carpool_rides')
  .insert({
    driver_id: 'user_xxx',
    origin: 'Dakar',
    destination: 'Thiès',
    date_departure: '2025-02-10',
    time_departure: '14:00',
    price: 2000,
    seats_available: 3,
  })
  .select()
  .single();

// 2. Vérifier les logs Edge Function
// Dashboard → Edge Functions → on-ride-created → Logs
// Doit afficher: "📥 on-ride-created: {...}"

// 3. Vérifier la notification in-app
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', 'user_xxx')
  .eq('type', 'ride_published')
  .order('created_at', { ascending: false })
  .limit(1);

console.log(notifications); // Doit contenir la notification
```

### **Test 2: Réservation**

```typescript
// 1. Créer une réservation
const { data: booking } = await supabase
  .from('carpool_bookings')
  .insert({
    ride_id: ride.id,
    passenger_id: 'user_yyy',
    passenger_name: 'Test Passenger',
    passenger_phone: '771234567',
    number_of_passengers: 1,
    status: 'pending',
  })
  .select()
  .single();

// 2. Vérifier les logs Edge Function
// Dashboard → Edge Functions → on-reservation-requested → Logs

// 3. Vérifier les notifications
// - Driver doit recevoir: "🚗 Nouvelle demande de réservation !"
// - Passenger doit recevoir: "✅ Demande envoyée"
```

### **Test 3: Acceptation de réservation**

```typescript
// 1. Accepter la réservation
const { data } = await supabase
  .from('carpool_bookings')
  .update({ status: 'accepted' })
  .eq('id', booking.id)
  .select()
  .single();

// 2. Vérifier les logs Edge Function
// Dashboard → Edge Functions → on-reservation-status-changed → Logs

// 3. Vérifier la notification passenger
// "✅ Réservation acceptée !"
```

### **Test 4: Cron Jobs**

```sql
-- Vérifier l'exécution des cron jobs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- Doit afficher les exécutions récentes de:
-- - ride-reminders
-- - rating-requests
```

---

## 📊 MONITORING

### **1. Logs Edge Functions**

```bash
# Via Supabase Dashboard
# Edge Functions → [Nom de la fonction] → Logs

# Rechercher:
# - ✅ "on-ride-created: {...}" → Succès
# - ❌ "401 Unauthorized" → JWT verification activée
# - ❌ "execution_id=null" → Fonction bloquée avant exécution
```

### **2. Logs Notifications**

```sql
-- Vérifier les notifications envoyées
SELECT 
  type,
  channel,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_sent
FROM notification_logs
GROUP BY type, channel, status
ORDER BY last_sent DESC;

-- Vérifier les erreurs
SELECT *
FROM notification_logs
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 20;
```

### **3. Statistiques Notifications**

```sql
-- Notifications in-app par type
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN NOT is_read THEN 1 ELSE 0 END) as unread
FROM notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY total DESC;

-- Taux de lecture
SELECT 
  ROUND(100.0 * SUM(CASE WHEN is_read THEN 1 ELSE 0 END) / COUNT(*), 2) as read_rate
FROM notifications
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🚨 ACTIONS IMMÉDIATES REQUISES

### **PRIORITÉ 1 (CRITIQUE)**

1. **Désactiver JWT verification pour les Edge Functions**
   ```bash
   # Pour chaque fonction:
   supabase functions deploy on-ride-created --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-reservation-requested --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-reservation-status-changed --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-ride-status-changed --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-driver-arrived --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-ride-reminders --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   supabase functions deploy on-rating-request --project-ref drxtaxepofuoelplgrei --no-verify-jwt
   ```

2. **Configurer la Service Role Key**
   ```sql
   UPDATE app_config 
   SET value = 'VOTRE_VRAIE_CLE_ICI',
       updated_at = NOW()
   WHERE key = 'service_role_key';
   ```

### **PRIORITÉ 2 (IMPORTANT)**

3. **Vérifier les secrets Twilio**
   - Dashboard → Edge Functions → Settings → Secrets
   - Vérifier `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`

4. **Tester le système complet**
   - Créer un trajet de test
   - Créer une réservation de test
   - Vérifier les notifications dans la table `notifications`
   - Vérifier les logs dans `notification_logs`

### **PRIORITÉ 3 (RECOMMANDÉ)**

5. **Activer le mode production**
   ```bash
   # Quand tout fonctionne en test
   # Dashboard → Edge Functions → Settings → Secrets
   IS_PRODUCTION_MODE=true
   ```

6. **Configurer les alertes**
   - Créer des alertes pour les erreurs 401
   - Créer des alertes pour les échecs de notifications
   - Monitorer les cron jobs

---

## 📚 DOCUMENTATION COMPLÉMENTAIRE

- [EDGE_FUNCTIONS_JWT_FIX.md](./EDGE_FUNCTIONS_JWT_FIX.md) - Guide détaillé JWT
- [CRON_JOBS_CONFIGURATION_GUIDE.md](./CRON_JOBS_CONFIGURATION_GUIDE.md) - Configuration cron
- [NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md](./NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md) - Architecture complète
- [TESTING_GUIDE_NOTIFICATIONS.md](./TESTING_GUIDE_NOTIFICATIONS.md) - Guide de tests

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Extension `pg_cron` activée
- [ ] Cron jobs créés (`ride-reminders`, `rating-requests`)
- [ ] Triggers dupliqués supprimés
- [ ] Index de performance créés
- [ ] JWT verification désactivée pour toutes les Edge Functions
- [ ] Service Role Key configurée dans `app_config`
- [ ] Secrets Twilio configurés
- [ ] Tests de création de trajet effectués
- [ ] Tests de réservation effectués
- [ ] Logs Edge Functions vérifiés (pas de 401)
- [ ] Notifications in-app vérifiées
- [ ] Cron jobs vérifiés (exécution toutes les 5-10 min)
- [ ] Mode production activé (quand prêt)

---

## 🎯 RÉSULTAT ATTENDU

Après avoir appliqué toutes les corrections:

1. ✅ Création de trajet → Notification driver + alertes passagers
2. ✅ Réservation → Notification driver + confirmation passenger
3. ✅ Acceptation → Notification passenger
4. ✅ Refus → Notification passenger
5. ✅ Rappel J-1 → Notification driver + passengers (24h avant)
6. ✅ Rappel H-1 → Notification + WhatsApp driver + passengers (1h avant)
7. ✅ Trajet terminé → Demande de notation (10-30 min après)
8. ✅ Annulation → Notification concernés

---

**Dernière mise à jour**: 2 février 2025  
**Statut**: ⚠️ Actions manuelles requises (JWT + Service Role Key)
