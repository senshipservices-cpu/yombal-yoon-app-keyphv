
# 🧪 GUIDE DE TEST — PARTIE 1 : Corrections Techniques

## 📋 CHECKLIST COMPLÈTE

### ✅ 1. TEST DES RLS POLICIES

#### Test 1.1 : Isolation des données conducteur
```sql
-- Se connecter en tant que conducteur A (user_id = 'driver-a-uuid')
SET request.jwt.claims = '{"sub": "driver-a-uuid", "role": "authenticated"}';

-- Vérifier que le conducteur A ne voit que ses trajets
SELECT COUNT(*) FROM carpool_rides WHERE driver_id = 'driver-a-uuid';
-- Résultat attendu : Nombre de trajets du conducteur A

SELECT COUNT(*) FROM carpool_rides WHERE driver_id != 'driver-a-uuid';
-- Résultat attendu : 0 (ne doit pas voir les trajets des autres)
```

#### Test 1.2 : Isolation des données passager
```sql
-- Se connecter en tant que passager B (user_id = 'passenger-b-uuid')
SET request.jwt.claims = '{"sub": "passenger-b-uuid", "role": "authenticated"}';

-- Vérifier que le passager B ne voit que ses réservations
SELECT COUNT(*) FROM carpool_bookings WHERE passenger_id = 'passenger-b-uuid';
-- Résultat attendu : Nombre de réservations du passager B

SELECT COUNT(*) FROM carpool_bookings WHERE passenger_id != 'passenger-b-uuid';
-- Résultat attendu : 0 (ne doit pas voir les réservations des autres)
```

#### Test 1.3 : Visibilité des trajets ouverts
```sql
-- Se connecter en tant que n'importe quel utilisateur
SET request.jwt.claims = '{"sub": "any-user-uuid", "role": "authenticated"}';

-- Vérifier que tous les trajets ouverts sont visibles
SELECT COUNT(*) FROM carpool_rides 
WHERE status = 'open' AND ride_status IN ('pending', 'started');
-- Résultat attendu : Nombre total de trajets ouverts
```

#### Test 1.4 : Notifications isolées
```sql
-- Se connecter en tant qu'utilisateur C
SET request.jwt.claims = '{"sub": "user-c-uuid", "role": "authenticated"}';

-- Vérifier que l'utilisateur C ne voit que ses notifications
SELECT COUNT(*) FROM notifications WHERE user_id = 'user-c-uuid';
-- Résultat attendu : Nombre de notifications de l'utilisateur C

SELECT COUNT(*) FROM notifications WHERE user_id != 'user-c-uuid';
-- Résultat attendu : 0 (ne doit pas voir les notifications des autres)
```

#### Test 1.5 : Service role full access
```sql
-- Se connecter en tant que service_role
SET request.jwt.claims = '{"sub": "service-role", "role": "service_role"}';

-- Vérifier que le service_role voit tout
SELECT COUNT(*) FROM carpool_rides;
SELECT COUNT(*) FROM carpool_bookings;
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM user_profiles;
-- Résultat attendu : Tous les enregistrements de chaque table
```

---

### ✅ 2. TEST DES INDEX

#### Test 2.1 : Performance de recherche de trajets
```sql
-- Test AVANT index (simulé)
EXPLAIN ANALYZE
SELECT * FROM carpool_rides
WHERE departure_city = 'Dakar'
  AND arrival_city = 'Kaolack'
  AND departure_datetime > NOW()
  AND status = 'open'
  AND ride_status = 'pending';

-- Résultat attendu : 
-- - Index Scan using idx_carpool_rides_search
-- - Execution time < 10ms
```

#### Test 2.2 : Performance de jointure bookings
```sql
-- Test jointure ride + bookings
EXPLAIN ANALYZE
SELECT r.*, b.*
FROM carpool_rides r
JOIN carpool_bookings b ON r.id = b.ride_id
WHERE b.passenger_id = 'passenger-uuid';

-- Résultat attendu :
-- - Index Scan using idx_carpool_bookings_ride_passenger
-- - Execution time < 5ms
```

#### Test 2.3 : Performance de récupération notifications
```sql
-- Test récupération notifications utilisateur
EXPLAIN ANALYZE
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20;

-- Résultat attendu :
-- - Index Scan using idx_notifications_user_created
-- - Execution time < 3ms
```

---

### ✅ 3. TEST DES CRON JOBS

#### Test 3.1 : Vérifier la planification
```sql
-- Vérifier que les cron jobs sont actifs
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    command
FROM cron.job
WHERE jobname IN ('ride-reminders-v2', 'rating-requests-v2');

-- Résultat attendu :
-- - 2 jobs actifs
-- - ride-reminders-v2 : */10 * * * *
-- - rating-requests-v2 : */5 * * * *
```

#### Test 3.2 : Vérifier les exécutions récentes
```sql
-- Attendre 10 minutes après la configuration, puis :
SELECT 
    j.jobname,
    r.start_time,
    r.end_time,
    r.status,
    r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.jobname IN ('ride-reminders-v2', 'rating-requests-v2')
ORDER BY r.start_time DESC
LIMIT 10;

-- Résultat attendu :
-- - status = 'succeeded' (pas 'failed')
-- - return_message contient un JSON avec success: true
```

#### Test 3.3 : Tester manuellement on-ride-reminders
```bash
# Créer un trajet de test qui part dans 24h
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/rest/v1/carpool_rides \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "your-user-id",
    "driver_name": "Test Driver",
    "driver_phone": "+221771234567",
    "departure_city": "Dakar",
    "arrival_city": "Kaolack",
    "departure_datetime": "2025-06-02T10:00:00Z",
    "seats_total": 4,
    "seats_available": 4,
    "price_per_seat": 5000,
    "status": "open",
    "ride_status": "pending"
  }'

# Attendre 10 minutes (prochain cron)
# Vérifier les notifications
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
  AND type = 'reminder_j_minus_1'
ORDER BY created_at DESC
LIMIT 1;

# Résultat attendu : 1 notification de rappel J-1
```

#### Test 3.4 : Tester manuellement on-rating-request
```bash
# Créer un trajet terminé il y a 15 minutes
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/rest/v1/carpool_rides \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "your-user-id",
    "driver_name": "Test Driver",
    "driver_phone": "+221771234567",
    "departure_city": "Dakar",
    "arrival_city": "Kaolack",
    "departure_datetime": "2025-06-01T08:00:00Z",
    "seats_total": 4,
    "seats_available": 4,
    "price_per_seat": 5000,
    "status": "open",
    "ride_status": "ended",
    "ended_at": "2025-06-01T09:45:00Z",
    "rating_requested_at": null
  }'

# Attendre 5 minutes (prochain cron)
# Vérifier les notifications
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
  AND type = 'rating_request'
ORDER BY created_at DESC
LIMIT 1;

# Résultat attendu : 1 notification de demande de notation
```

---

### ✅ 4. TEST DES EDGE FUNCTIONS (JWT)

#### Test 4.1 : Appel sans JWT (doit fonctionner)
```bash
# Test on-ride-reminders sans JWT
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders \
  -H "Content-Type: application/json" \
  -d '{}'

# Résultat attendu : 
# - Status 200
# - JSON avec success: true
```

#### Test 4.2 : Appel avec service_role (doit fonctionner)
```bash
# Test on-rating-request avec service_role
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{}'

# Résultat attendu :
# - Status 200
# - JSON avec success: true
```

#### Test 4.3 : Vérifier les logs Edge Functions
```bash
# Dans le Dashboard Supabase :
# Edge Functions → on-ride-reminders → Logs

# Chercher les logs récents
# Résultat attendu :
# - Status 200 (pas 401)
# - Logs structurés avec [ENTRY], [DECISION], [SEND], [SUCCESS]
```

---

### ✅ 5. TEST DES VARIABLES D'ENVIRONNEMENT

#### Test 5.1 : Vérifier IS_PRODUCTION_MODE
```bash
# Appeler send-notification-unified
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "type": "test",
    "userId": "test-user-id",
    "title": "Test",
    "message": "Test message",
    "channels": ["in_app"]
  }'

# Vérifier la réponse
# Résultat attendu :
# - JSON avec "mode": "production" ou "mode": "test"
```

#### Test 5.2 : Vérifier Twilio (si IS_PRODUCTION_MODE = true)
```bash
# Appeler send-notification-unified avec WhatsApp
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "type": "test",
    "userId": "test-user-id",
    "title": "Test WhatsApp",
    "message": "Test message WhatsApp",
    "channels": ["whatsapp"],
    "phoneNumber": "+221771234567"
  }'

# Vérifier la réponse
# Résultat attendu :
# - JSON avec channels.whatsapp.success: true
# - Ou error si Twilio non configuré
```

---

### ✅ 6. TEST DES LOGS STRUCTURÉS

#### Test 6.1 : Vérifier les logs d'entrée
```bash
# Appeler on-ride-reminders
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders \
  -H "Content-Type: application/json" \
  -d '{}'

# Vérifier les logs dans le Dashboard
# Résultat attendu :
# ========================================
# 📥 [ENTRY] on-ride-reminders: Starting scheduled job
# ⏰ [ENTRY] Timestamp: 2025-06-01T10:00:00.000Z
# ========================================
```

#### Test 6.2 : Vérifier les logs de décision
```bash
# Résultat attendu dans les logs :
# 🔍 [DECISION] Time windows calculated:
#   - J-1:  2025-06-02T09:00:00.000Z to 2025-06-02T10:00:00.000Z
#   - H-1:  2025-06-01T10:59:00.000Z to 2025-06-01T11:00:00.000Z
# 📅 [DECISION] Found 2 rides for J-1 reminders
```

#### Test 6.3 : Vérifier les logs d'envoi
```bash
# Résultat attendu dans les logs :
# 📤 [SEND] Sending J-1 reminder to driver driver-uuid for ride ride-uuid
# ✅ [SEND] J-1 reminder sent to driver driver-uuid
# 📤 [SEND] Sending J-1 reminders to 3 passengers for ride ride-uuid
# ✅ [SEND] J-1 reminder sent to passenger passenger-uuid
```

#### Test 6.4 : Vérifier les logs de succès
```bash
# Résultat attendu dans les logs :
# ========================================
# ✅ [SUCCESS] Reminders sent: J-1=2, H-1=1
# ⏱️ [SUCCESS] Execution time: 1234ms
# ========================================
```

---

### ✅ 7. TEST DE LA TABLE NOTIFICATION_LOGS

#### Test 7.1 : Vérifier l'insertion des logs
```sql
-- Après avoir envoyé des notifications, vérifier :
SELECT 
    channel,
    status,
    COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY channel, status
ORDER BY channel, status;

-- Résultat attendu :
-- in_app  | success | 10
-- push    | success | 8
-- whatsapp| success | 2
```

#### Test 7.2 : Vérifier les erreurs loggées
```sql
-- Vérifier les erreurs récentes
SELECT 
    channel,
    status,
    error_message,
    created_at
FROM notification_logs
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- Résultat attendu :
-- - Peu ou pas d'erreurs
-- - Si erreurs, vérifier error_message pour diagnostiquer
```

---

## 📊 TABLEAU DE RÉSULTATS

| Test | Statut | Résultat | Notes |
|------|--------|----------|-------|
| 1.1 RLS Conducteur | ⬜ | | |
| 1.2 RLS Passager | ⬜ | | |
| 1.3 RLS Trajets ouverts | ⬜ | | |
| 1.4 RLS Notifications | ⬜ | | |
| 1.5 RLS Service role | ⬜ | | |
| 2.1 Index Recherche | ⬜ | | |
| 2.2 Index Jointure | ⬜ | | |
| 2.3 Index Notifications | ⬜ | | |
| 3.1 Cron Planification | ⬜ | | |
| 3.2 Cron Exécutions | ⬜ | | |
| 3.3 Cron Reminders | ⬜ | | |
| 3.4 Cron Rating | ⬜ | | |
| 4.1 JWT Sans token | ⬜ | | |
| 4.2 JWT Service role | ⬜ | | |
| 4.3 JWT Logs | ⬜ | | |
| 5.1 Env Production mode | ⬜ | | |
| 5.2 Env Twilio | ⬜ | | |
| 6.1 Logs Entrée | ⬜ | | |
| 6.2 Logs Décision | ⬜ | | |
| 6.3 Logs Envoi | ⬜ | | |
| 6.4 Logs Succès | ⬜ | | |
| 7.1 Logs Insertion | ⬜ | | |
| 7.2 Logs Erreurs | ⬜ | | |

**Cocher les cases au fur et à mesure des tests.**

---

## 🚨 EN CAS D'ERREUR

### Erreur 401 sur cron jobs
→ Vérifier que JWT verification est désactivée (voir QUICK_FIX_JWT_VERIFICATION.md)

### Erreur RLS "permission denied"
→ Vérifier que les policies sont bien créées et que le JWT contient le bon user_id

### Index non utilisé
→ Vérifier avec EXPLAIN ANALYZE et recréer l'index si nécessaire

### Notifications non envoyées
→ Vérifier les logs dans notification_logs et les logs Edge Functions

---

**Temps estimé** : 1-2 heures  
**Priorité** : 🟡 **IMPORTANT**  
**Prérequis** : JWT verification désactivée

---

**Auteur** : Natively AI  
**Date** : 2025-06-01
