
# 🚀 QUICK REFERENCE - TESTS NOTIFICATIONS COVOITURAGE

## 📋 COMMANDES RAPIDES

### Vérifier le mode production

```bash
# Voir le mode actuel
supabase secrets get IS_PRODUCTION_MODE

# Activer mode test
supabase secrets set IS_PRODUCTION_MODE=false

# Activer mode production
supabase secrets set IS_PRODUCTION_MODE=true
```

### Invoquer manuellement les Edge Functions

```bash
# Test on-rating-request
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'

# Test on-ride-reminders
curl -X POST \
  'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'

# Test send-notification-unified
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
```

---

## 🔍 REQUÊTES SQL ESSENTIELLES

### Vérifier les notifications récentes

```sql
-- Dernières notifications in-app
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 20;

-- Derniers logs de notifications
SELECT 
  channel,
  status,
  payload->>'title' as title,
  error_message,
  created_at
FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### Vérifier les trajets et réservations

```sql
-- Trajets récents
SELECT 
  id,
  departure_city,
  arrival_city,
  departure_datetime,
  ride_status,
  seats_available
FROM carpool_rides 
ORDER BY created_at DESC 
LIMIT 10;

-- Réservations récentes
SELECT 
  cb.id,
  cb.status,
  cb.passenger_name,
  cr.departure_city,
  cr.arrival_city
FROM carpool_bookings cb
JOIN carpool_rides cr ON cb.ride_id = cr.id
ORDER BY cb.created_at DESC 
LIMIT 10;
```

### Surveiller les erreurs

```sql
-- Erreurs des dernières 24h
SELECT 
  channel,
  error_message,
  COUNT(*) as occurrences
FROM notification_logs
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, error_message
ORDER BY occurrences DESC;

-- Taux de succès par canal
SELECT 
  channel,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel;
```

### Vérifier les cron jobs

```sql
-- Lister les cron jobs
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
ORDER BY jobname;

-- Historique d'exécution
SELECT 
  j.jobname,
  jrd.status,
  jrd.return_message,
  jrd.start_time,
  jrd.end_time
FROM cron.job_run_details jrd
JOIN cron.job j ON jrd.jobid = j.jobid
WHERE j.jobname IN ('rating-request-cron', 'ride-reminders-cron')
ORDER BY jrd.start_time DESC
LIMIT 20;
```

---

## 🧪 SCÉNARIOS DE TEST RAPIDES

### Test 1 : Publication de trajet

```sql
-- 1. Créer un trajet
INSERT INTO carpool_rides (
  driver_id, driver_name, driver_phone,
  departure_city, arrival_city,
  departure_datetime,
  seats_total, seats_available, price_per_seat
) VALUES (
  'test-driver-id', 'Test Driver', '+221771234567',
  'Dakar', 'Thiès',
  NOW() + INTERVAL '1 day',
  3, 3, 2000
);

-- 2. Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_created'
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 2 : Demande de réservation

```sql
-- 1. Créer une réservation
INSERT INTO carpool_bookings (
  ride_id, passenger_id, passenger_name, passenger_phone,
  number_of_passengers, status
) VALUES (
  'ride-id-here', 'test-passenger-id', 'Test Passenger', '+221772222222',
  2, 'pending'
);

-- 2. Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'reservation_requested'
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 3 : Acceptation de réservation

```sql
-- 1. Accepter la réservation
UPDATE carpool_bookings
SET status = 'accepted'
WHERE id = 'booking-id-here';

-- 2. Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'reservation_accepted'
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📊 DASHBOARD RAPIDE

```sql
-- Vue d'ensemble des dernières 24h
SELECT 
  'Total notifications' as metric,
  COUNT(*) as value
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'In-app' as metric,
  COUNT(*) as value
FROM notification_logs
WHERE channel = 'in_app'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Push' as metric,
  COUNT(*) as value
FROM notification_logs
WHERE channel = 'push'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'WhatsApp' as metric,
  COUNT(*) as value
FROM notification_logs
WHERE channel = 'whatsapp'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Erreurs' as metric,
  COUNT(*) as value
FROM notification_logs
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Taux de succès (%)' as metric,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / NULLIF(COUNT(*), 0), 2) as value
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔧 CONFIGURATION CRON JOBS

### Créer les cron jobs

```sql
-- 1. Activer pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Configurer service_role_key
ALTER DATABASE postgres SET app.settings.service_role_key TO 'YOUR_SERVICE_ROLE_KEY';
SELECT pg_reload_conf();

-- 3. Créer cron rating-request (toutes les 15 min)
SELECT cron.schedule(
  'rating-request-cron',
  '*/15 * * * *',
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

-- 4. Créer cron ride-reminders (toutes les 15 min)
SELECT cron.schedule(
  'ride-reminders-cron',
  '*/15 * * * *',
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
```

### Gérer les cron jobs

```sql
-- Lister tous les cron jobs
SELECT * FROM cron.job;

-- Désactiver un cron
SELECT cron.unschedule('rating-request-cron');

-- Supprimer un cron
SELECT cron.unschedule('rating-request-cron');
```

---

## 🚨 DÉPANNAGE RAPIDE

### Problème : Notifications push non reçues

```sql
-- Vérifier les tokens actifs
SELECT 
  dt.user_id,
  dt.platform,
  dt.active,
  dt.last_used_at,
  up.full_name
FROM device_tokens dt
JOIN user_profiles up ON dt.user_id = up.id
WHERE dt.user_id = 'user-id-here';

-- Réactiver un token
UPDATE device_tokens
SET active = true
WHERE user_id = 'user-id-here';
```

### Problème : Messages WhatsApp non envoyés

```sql
-- Vérifier l'opt-in WhatsApp
SELECT 
  id,
  full_name,
  phone_number,
  whatsapp_optin
FROM user_profiles
WHERE id = 'user-id-here';

-- Activer l'opt-in
UPDATE user_profiles
SET whatsapp_optin = true
WHERE id = 'user-id-here';
```

### Problème : Cron jobs ne s'exécutent pas

```sql
-- Vérifier l'historique
SELECT 
  j.jobname,
  jrd.status,
  jrd.return_message,
  jrd.start_time
FROM cron.job_run_details jrd
JOIN cron.job j ON jrd.jobid = j.jobid
ORDER BY jrd.start_time DESC
LIMIT 10;

-- Vérifier la configuration
SELECT current_setting('app.settings.service_role_key');
```

---

## 📱 TESTS MANUELS SUR MOBILE

### Enregistrer un token push de test

```typescript
// Dans l'app React Native
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission refusée');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Token:', token);

  // Enregistrer dans Supabase
  await supabase.from('device_tokens').insert({
    user_id: 'your-user-id',
    expo_push_token: token,
    platform: Platform.OS,
    active: true,
  });
}
```

### Tester une notification push

```bash
# Envoyer un push de test via Expo
curl -X POST https://exp.host/--/api/v2/push/send \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "Test",
    "body": "Message de test",
    "sound": "default"
  }'
```

---

## 🎯 CHECKLIST RAPIDE

### Avant de tester

- [ ] IS_PRODUCTION_MODE configuré
- [ ] Secrets Twilio configurés
- [ ] Cron jobs créés et actifs
- [ ] Tokens push enregistrés
- [ ] Comptes de test créés

### Pendant les tests

- [ ] Vérifier les notifications in-app
- [ ] Vérifier les logs
- [ ] Vérifier les statuts
- [ ] Vérifier l'absence de doublons

### Après les tests

- [ ] Analyser les logs d'erreurs
- [ ] Vérifier les taux de succès
- [ ] Documenter les problèmes
- [ ] Appliquer les corrections

---

## 📞 CONTACTS UTILES

- **Supabase Dashboard:** https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
- **Twilio Console:** https://console.twilio.com
- **Expo Push Tool:** https://expo.dev/notifications

---

**Dernière mise à jour :** 2025-01-31
