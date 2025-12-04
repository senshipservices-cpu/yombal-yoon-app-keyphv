
# GUIDE DE TEST DES EDGE FUNCTIONS COVOITURAGE

## 🧪 TESTS COMPLETS DU SYSTÈME DE NOTIFICATIONS

---

## 📋 PRÉREQUIS

- ✅ Toutes les Edge Functions déployées
- ✅ Variables d'environnement configurées
- ✅ Mode test activé (`IS_PRODUCTION_MODE=false`)
- ✅ Compte utilisateur test créé

---

## 🔧 CONFIGURATION INITIALE

### 1. Activer le mode test:

```bash
# Dans Supabase Dashboard > Edge Functions > Secrets
IS_PRODUCTION_MODE=false
```

### 2. Créer des utilisateurs de test:

```sql
-- Conducteur test
INSERT INTO user_profiles (id, full_name, phone_number, whatsapp_optin)
VALUES ('driver-test-001', 'Marie Conductrice', '+221771234567', true);

-- Passager test
INSERT INTO user_profiles (id, full_name, phone_number, whatsapp_optin)
VALUES ('passenger-test-001', 'Jean Passager', '+221779876543', true);
```

---

## 🚀 TEST 1: PUBLICATION D'UN TRAJET

### Objectif:
Tester `on-ride-created` - Notification au conducteur + matching des alertes

### Étapes:

1. **Créer une alerte passager:**
```sql
INSERT INTO ride_alerts (
  user_id, origin, destination, date_filter, active
) VALUES (
  'passenger-test-001', 'Dakar', 'Kaolack', '2025-02-15', true
);
```

2. **Publier un trajet:**
```typescript
const { data: ride } = await supabase
  .from('carpool_rides')
  .insert({
    driver_id: 'driver-test-001',
    origin: 'Dakar',
    destination: 'Kaolack',
    date_departure: '2025-02-15',
    time_departure: '08:00',
    price_per_seat: 5000,
    seats_available: 3,
  })
  .select()
  .single();
```

3. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-ride-created', {
  body: {
    rideId: ride.id,
    driverId: 'driver-test-001',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
    price: 5000,
    seatsAvailable: 3,
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le conducteur
SELECT * FROM notifications
WHERE user_id = 'driver-test-001'
AND type = 'ride_published'
ORDER BY created_at DESC LIMIT 1;

-- 2. Notification in-app pour le passager (alerte matchée)
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'alert_match'
ORDER BY created_at DESC LIMIT 1;

-- 3. Logs de notifications
SELECT * FROM notification_logs
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Résultat attendu:
- ✅ 1 notification in-app pour le conducteur
- ✅ 1 notification in-app pour le passager
- ✅ 2 logs push (skipped en mode test)
- ✅ 0 logs WhatsApp (pas demandé)

---

## 📝 TEST 2: DEMANDE DE RÉSERVATION

### Objectif:
Tester `on-reservation-requested` - Notification au conducteur

### Étapes:

1. **Créer une réservation:**
```typescript
const { data: booking } = await supabase
  .from('carpool_bookings')
  .insert({
    ride_id: ride.id,
    passenger_id: 'passenger-test-001',
    number_of_passengers: 2,
    status: 'pending',
  })
  .select()
  .single();
```

2. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-reservation-requested', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    passengerId: 'passenger-test-001',
    passengerName: 'Jean Passager',
    passengerPhone: '+221779876543',
    numberOfPassengers: 2,
    driverId: 'driver-test-001',
    driverPhone: '+221771234567',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le conducteur
SELECT * FROM notifications
WHERE user_id = 'driver-test-001'
AND type = 'reservation_requested'
ORDER BY created_at DESC LIMIT 1;

-- 2. Notification in-app pour le passager (confirmation)
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'reservation_sent'
ORDER BY created_at DESC LIMIT 1;

-- 3. Vérifier si WhatsApp aurait été envoyé (si urgent)
SELECT * FROM notification_logs
WHERE channel = 'whatsapp'
AND created_at > NOW() - INTERVAL '5 minutes';
```

### Résultat attendu:
- ✅ 1 notification in-app pour le conducteur
- ✅ 1 notification in-app pour le passager
- ✅ 1 log push pour le conducteur
- ✅ 0 ou 1 log WhatsApp (selon urgence)

---

## ✅ TEST 3: ACCEPTATION DE RÉSERVATION

### Objectif:
Tester `on-reservation-status-changed` - Notification au passager

### Étapes:

1. **Accepter la réservation:**
```typescript
await supabase
  .from('carpool_bookings')
  .update({ status: 'accepted' })
  .eq('id', booking.id);
```

2. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-reservation-status-changed', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    status: 'accepted',
    passengerId: 'passenger-test-001',
    passengerPhone: '+221779876543',
    driverId: 'driver-test-001',
    driverName: 'Marie Conductrice',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le passager
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'reservation_accepted'
ORDER BY created_at DESC LIMIT 1;

-- 2. Logs
SELECT * FROM notification_logs
WHERE user_id = 'passenger-test-001'
AND created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Résultat attendu:
- ✅ 1 notification in-app pour le passager
- ✅ 1 log push
- ✅ 0 ou 1 log WhatsApp (selon proximité du départ)

---

## 📍 TEST 4: CONDUCTEUR ARRIVÉ

### Objectif:
Tester `on-driver-arrived` - Notification aux passagers

### Étapes:

1. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-driver-arrived', {
  body: {
    rideId: ride.id,
    driverId: 'driver-test-001',
    driverName: 'Marie Conductrice',
    meetingPoint: 'Gare routière Pompiers',
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le passager
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'driver_arrived'
ORDER BY created_at DESC LIMIT 1;

-- 2. Logs (push + WhatsApp)
SELECT * FROM notification_logs
WHERE user_id = 'passenger-test-001'
AND created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Résultat attendu:
- ✅ 1 notification in-app
- ✅ 1 log push
- ✅ 1 log WhatsApp (skipped en mode test)

---

## 🚗 TEST 5: DÉMARRAGE DU TRAJET

### Objectif:
Tester `on-ride-status-changed` - Notification aux passagers

### Étapes:

1. **Démarrer le trajet:**
```typescript
await supabase
  .from('carpool_rides')
  .update({ 
    ride_status: 'started',
    started_at: new Date().toISOString(),
  })
  .eq('id', ride.id);
```

2. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId: ride.id,
    status: 'started',
    driverId: 'driver-test-001',
    driverName: 'Marie Conductrice',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le passager
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'ride_started'
ORDER BY created_at DESC LIMIT 1;
```

### Résultat attendu:
- ✅ 1 notification in-app
- ✅ 0 log push (in-app seulement)

---

## ❌ TEST 6: ANNULATION PAR LE CONDUCTEUR

### Objectif:
Tester `on-ride-status-changed` - Notification aux passagers

### Étapes:

1. **Annuler le trajet:**
```typescript
await supabase
  .from('carpool_rides')
  .update({ ride_status: 'cancelled' })
  .eq('id', ride.id);
```

2. **Déclencher la fonction:**
```typescript
const { data, error } = await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId: ride.id,
    status: 'cancelled',
    driverId: 'driver-test-001',
    driverName: 'Marie Conductrice',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
    cancelledBy: 'driver',
  },
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notification in-app pour le passager
SELECT * FROM notifications
WHERE user_id = 'passenger-test-001'
AND type = 'ride_cancelled'
ORDER BY created_at DESC LIMIT 1;

-- 2. Logs (push + WhatsApp)
SELECT * FROM notification_logs
WHERE user_id = 'passenger-test-001'
AND type = 'ride_cancelled'
AND created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Résultat attendu:
- ✅ 1 notification in-app
- ✅ 1 log push
- ✅ 1 log WhatsApp (skipped en mode test)

---

## ⏰ TEST 7: RAPPELS (CRON JOB)

### Objectif:
Tester `on-ride-reminders` - Rappels J-1 et H-1

### Étapes:

1. **Créer un trajet dans 24h:**
```sql
INSERT INTO carpool_rides (
  driver_id, origin, destination,
  departure_datetime, ride_status
) VALUES (
  'driver-test-001', 'Dakar', 'Kaolack',
  NOW() + INTERVAL '24 hours', 'pending'
);
```

2. **Exécuter manuellement le cron:**
```typescript
const { data, error } = await supabase.functions.invoke('on-ride-reminders', {
  body: {},
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notifications J-1
SELECT * FROM notifications
WHERE type = 'reminder_j_minus_1'
AND created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 2. Logs
SELECT * FROM notification_logs
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Résultat attendu:
- ✅ 1 notification in-app pour le conducteur
- ✅ 1 notification in-app pour chaque passager
- ✅ Logs push correspondants

---

## ⭐ TEST 8: DEMANDE DE NOTATION (CRON JOB)

### Objectif:
Tester `on-rating-request` - Demande de notation après le trajet

### Étapes:

1. **Terminer un trajet il y a 15 minutes:**
```sql
UPDATE carpool_rides
SET 
  ride_status = 'ended',
  ended_at = NOW() - INTERVAL '15 minutes',
  rating_requested_at = NULL
WHERE id = 'test-ride-id';
```

2. **Exécuter manuellement le cron:**
```typescript
const { data, error } = await supabase.functions.invoke('on-rating-request', {
  body: {},
});

console.log('Résultat:', data);
```

### Vérifications:

```sql
-- 1. Notifications de notation
SELECT * FROM notifications
WHERE type = 'rating_request'
AND created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 2. Vérifier que rating_requested_at est mis à jour
SELECT rating_requested_at FROM carpool_rides
WHERE id = 'test-ride-id';
```

### Résultat attendu:
- ✅ 1 notification pour le conducteur
- ✅ 1 notification pour chaque passager
- ✅ `rating_requested_at` mis à jour

---

## 🔍 TESTS DE VÉRIFICATION GLOBALE

### 1. Vérifier tous les types de notifications:

```sql
SELECT 
  type,
  COUNT(*) as count
FROM notifications
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY type
ORDER BY count DESC;
```

### 2. Vérifier les logs par canal:

```sql
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY channel, status
ORDER BY count DESC;
```

### 3. Vérifier les erreurs:

```sql
SELECT * FROM notification_logs
WHERE status = 'error'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 🧹 NETTOYAGE APRÈS LES TESTS

```sql
-- Supprimer les données de test
DELETE FROM notifications WHERE user_id IN ('driver-test-001', 'passenger-test-001');
DELETE FROM notification_logs WHERE user_id IN ('driver-test-001', 'passenger-test-001');
DELETE FROM carpool_bookings WHERE passenger_id = 'passenger-test-001';
DELETE FROM carpool_rides WHERE driver_id = 'driver-test-001';
DELETE FROM ride_alerts WHERE user_id = 'passenger-test-001';
DELETE FROM user_profiles WHERE id IN ('driver-test-001', 'passenger-test-001');
```

---

## ✅ CHECKLIST DE TESTS

- [ ] Test 1: Publication de trajet ✅
- [ ] Test 2: Demande de réservation ✅
- [ ] Test 3: Acceptation de réservation ✅
- [ ] Test 4: Conducteur arrivé ✅
- [ ] Test 5: Démarrage du trajet ✅
- [ ] Test 6: Annulation par conducteur ✅
- [ ] Test 7: Rappels (cron) ✅
- [ ] Test 8: Demande de notation (cron) ✅
- [ ] Vérification globale ✅
- [ ] Nettoyage ✅

---

## 🚨 TROUBLESHOOTING

### Problème: Aucune notification créée

**Solutions:**
1. Vérifier que l'Edge Function est déployée
2. Vérifier les logs de l'Edge Function
3. Vérifier que l'utilisateur existe dans `user_profiles`

### Problème: Erreur d'authentification

**Solutions:**
1. Vérifier la service role key
2. Vérifier les headers HTTP
3. Vérifier que l'Edge Function a `verify_jwt: true`

### Problème: WhatsApp non envoyé

**Solutions:**
1. Vérifier `IS_PRODUCTION_MODE=true`
2. Vérifier `whatsapp_optin=true` pour l'utilisateur
3. Vérifier les credentials Twilio

---

**Tests terminés! Le système de notifications est opérationnel. 🎉**
