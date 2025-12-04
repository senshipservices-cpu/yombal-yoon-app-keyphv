
# 🧪 GUIDE DE TEST — Système de Notifications

Guide complet pour tester le système de notifications du module Covoiturage.

---

## 📋 PRÉREQUIS

Avant de commencer les tests :

- ✅ Migration Supabase appliquée
- ✅ Edge Function `send-notification-unified` déployée
- ✅ Secrets Twilio configurés (pour tests WhatsApp)
- ✅ App installée sur un appareil physique (pour tests push)

---

## 🧪 TESTS DE BASE DE DONNÉES

### 1. Vérifier les tables

```sql
-- Lister toutes les tables de notifications
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles',
    'carpool_rides',
    'carpool_bookings',
    'ride_alerts',
    'device_tokens',
    'notifications',
    'notification_logs'
  );
```

**Résultat attendu** : 7 tables listées

### 2. Vérifier les RLS policies

```sql
-- Vérifier les policies sur device_tokens
SELECT * FROM pg_policies 
WHERE tablename = 'device_tokens';

-- Vérifier les policies sur notifications
SELECT * FROM pg_policies 
WHERE tablename = 'notifications';
```

**Résultat attendu** : Policies créées pour chaque table

### 3. Tester les fonctions helper

```sql
-- Test 1: Créer une notification
SELECT create_notification(
  'test_user_id',
  'test',
  'Test Notification',
  'This is a test message',
  '{"test": true}'::jsonb
);

-- Test 2: Vérifier la notification créée
SELECT * FROM notifications 
WHERE user_id = 'test_user_id' 
ORDER BY created_at DESC 
LIMIT 1;

-- Test 3: Logger une notification
SELECT log_notification(
  'test_user_id',
  'push',
  '{"title": "Test", "message": "Test"}'::jsonb,
  'success',
  NULL
);

-- Test 4: Vérifier le log
SELECT * FROM notification_logs 
WHERE user_id = 'test_user_id' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Résultat attendu** : Notifications et logs créés avec succès

---

## 🔧 TESTS DE L'EDGE FUNCTION

### 1. Test basique (in-app seulement)

```bash
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "test",
    "userId": "test_user_id",
    "title": "Test Notification",
    "message": "This is a test message",
    "channels": ["in_app"]
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "notificationId": "uuid-here",
  "channels": {
    "in_app": {
      "success": true,
      "id": "uuid-here"
    }
  }
}
```

### 2. Test avec push notification

```bash
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "test",
    "userId": "test_user_id",
    "title": "Test Push",
    "message": "This is a push notification test",
    "channels": ["in_app", "push"]
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "notificationId": "uuid-here",
  "channels": {
    "in_app": {
      "success": true,
      "id": "uuid-here"
    },
    "push": {
      "success": true
    }
  }
}
```

### 3. Test avec WhatsApp

```bash
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "test",
    "userId": "test_user_id",
    "title": "Test WhatsApp",
    "message": "This is a WhatsApp notification test",
    "channels": ["in_app", "whatsapp"],
    "phoneNumber": "+221771234567"
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "notificationId": "uuid-here",
  "channels": {
    "in_app": {
      "success": true,
      "id": "uuid-here"
    },
    "whatsapp": {
      "success": true
    }
  }
}
```

---

## 📱 TESTS FRONTEND

### 1. Test du contexte de notifications

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function TestComponent() {
  const { 
    notifications, 
    unreadCount, 
    registerForPushNotifications,
    sendLocalNotification 
  } = useNotifications();

  useEffect(() => {
    console.log('📊 Notifications:', notifications.length);
    console.log('🔔 Unread:', unreadCount);
  }, [notifications, unreadCount]);

  const testNotification = async () => {
    await sendLocalNotification(
      'Test Notification',
      'This is a test from the app',
      { test: true },
      'covoiturage-general'
    );
  };

  return (
    <Button onPress={testNotification}>
      Send Test Notification
    </Button>
  );
}
```

### 2. Test d'enregistrement de token push

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function TestPushToken() {
  const { registerForPushNotifications, deviceToken } = useNotifications();

  useEffect(() => {
    const register = async () => {
      await registerForPushNotifications('test_user_id', ['driver', 'passenger']);
      console.log('✅ Token registered:', deviceToken);
    };
    register();
  }, []);

  return (
    <View>
      <Text>Device Token: {deviceToken || 'Not registered'}</Text>
    </View>
  );
}
```

### 3. Test du service de notifications

```typescript
import {
  notifyDriverNewReservation,
  notifyPassengerReservationAccepted,
} from '@/utils/notificationService';

async function testNotificationService() {
  // Test 1: Nouvelle réservation
  const result1 = await notifyDriverNewReservation({
    driverId: 'driver_123',
    driverPhone: '+221771234567',
    passengerName: 'Jean Dupont',
    numberOfPassengers: 2,
    route: {
      from: 'Dakar',
      to: 'Kaolack',
      date: '15 janvier 2025',
      time: '14:00',
    },
    reservationId: 'res_456',
    rideId: 'ride_789',
    isUrgent: false,
  });
  
  console.log('✅ Test 1 result:', result1);

  // Test 2: Réservation acceptée
  const result2 = await notifyPassengerReservationAccepted({
    passengerId: 'passenger_123',
    passengerPhone: '+221771234567',
    driverName: 'Marie Martin',
    route: {
      from: 'Dakar',
      to: 'Kaolack',
      date: '15 janvier 2025',
      time: '14:00',
    },
    reservationId: 'res_456',
    rideId: 'ride_789',
    isCloseToDepart: false,
  });
  
  console.log('✅ Test 2 result:', result2);
}
```

---

## 🔍 TESTS DE MATCHING D'ALERTES

### 1. Créer une alerte de test

```sql
INSERT INTO ride_alerts (
  user_id,
  user_name,
  user_phone,
  origin,
  destination,
  date_from,
  date_to,
  time_range_start,
  time_range_end,
  max_price,
  min_seats,
  accepts_luggage,
  is_active
) VALUES (
  'test_passenger_id',
  'Jean Dupont',
  '+221771234567',
  'Dakar',
  'Kaolack',
  '2025-01-15',
  '2025-01-20',
  '12:00:00',
  '18:00:00',
  5000,
  1,
  true,
  true
);
```

### 2. Créer un trajet correspondant

```sql
INSERT INTO carpool_rides (
  driver_id,
  driver_name,
  driver_phone,
  origin,
  destination,
  date_departure,
  time_departure,
  price,
  seats_total,
  seats_available,
  ride_status
) VALUES (
  'test_driver_id',
  'Marie Martin',
  '+221771234568',
  'Dakar',
  'Kaolack',
  '2025-01-16',
  '14:00:00',
  4000,
  4,
  4,
  'pending'
);
```

### 3. Vérifier le matching

```sql
-- Requête de matching
SELECT 
  ra.*,
  cr.id as ride_id,
  cr.driver_name,
  cr.price
FROM ride_alerts ra
CROSS JOIN carpool_rides cr
WHERE ra.is_active = true
  AND ra.origin = cr.origin
  AND ra.destination = cr.destination
  AND cr.date_departure BETWEEN ra.date_from AND ra.date_to
  AND cr.time_departure BETWEEN ra.time_range_start AND ra.time_range_end
  AND (ra.max_price IS NULL OR cr.price <= ra.max_price)
  AND cr.seats_available >= ra.min_seats
  AND cr.ride_status = 'pending';
```

**Résultat attendu** : 1 ligne correspondant à l'alerte et au trajet

---

## 📊 TESTS DE MONITORING

### 1. Statistiques de notifications

```sql
-- Notifications par type (dernières 24h)
SELECT 
  type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_read = true) as read_count,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY count DESC;
```

### 2. Taux de succès par canal

```sql
-- Taux de succès par canal (derniers 7 jours)
SELECT 
  channel,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success_count,
  COUNT(*) FILTER (WHERE status = 'error') as error_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*),
    2
  ) as success_rate
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY channel
ORDER BY channel;
```

### 3. Erreurs récentes

```sql
-- Dernières erreurs de notification
SELECT 
  nl.*,
  up.full_name,
  up.phone_number
FROM notification_logs nl
JOIN user_profiles up ON nl.user_id = up.id
WHERE nl.status = 'error'
  AND nl.created_at > NOW() - INTERVAL '24 hours'
ORDER BY nl.created_at DESC
LIMIT 10;
```

---

## ✅ CHECKLIST DE TEST

### Base de données
- [ ] Tables créées
- [ ] RLS policies actives
- [ ] Indexes créés
- [ ] Fonctions helper fonctionnelles
- [ ] Triggers actifs

### Edge Function
- [ ] Déployée avec succès
- [ ] Endpoint accessible
- [ ] Test in-app réussi
- [ ] Test push réussi
- [ ] Test WhatsApp réussi
- [ ] Logging fonctionnel

### Frontend
- [ ] Contexte de notifications fonctionnel
- [ ] Enregistrement de token push réussi
- [ ] Affichage des notifications
- [ ] Marquage comme lu fonctionnel
- [ ] Navigation depuis notifications

### Intégration
- [ ] Nouvelle réservation → notification conducteur
- [ ] Acceptation → notification passager
- [ ] Refus → notification passager
- [ ] Annulation → notifications appropriées
- [ ] Rappels J-1 et H-1
- [ ] Demande de notation

### Alertes
- [ ] Création d'alerte
- [ ] Matching avec trajet
- [ ] Notification passager
- [ ] Désactivation d'alerte

---

## 🐛 DEBUGGING

### Logs Edge Function

```bash
# Voir les logs en temps réel
supabase functions logs send-notification-unified --follow

# Logs des dernières 24h
supabase functions logs send-notification-unified
```

### Vérifier les tokens

```sql
-- Tokens actifs
SELECT * FROM device_tokens 
WHERE active = true 
ORDER BY last_used_at DESC;

-- Tokens par utilisateur
SELECT * FROM device_tokens 
WHERE user_id = 'test_user_id';
```

### Vérifier les notifications

```sql
-- Dernières notifications
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Notifications non lues
SELECT * FROM notifications 
WHERE is_read = false 
ORDER BY created_at DESC;
```

### Vérifier les logs

```sql
-- Derniers logs
SELECT * FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Logs avec erreurs
SELECT * FROM notification_logs 
WHERE status = 'error' 
ORDER BY created_at DESC;
```

---

## 📝 RAPPORT DE TEST

Après avoir effectué tous les tests, remplir ce rapport :

### Résultats

| Test | Status | Notes |
|------|--------|-------|
| Tables créées | ⏳ | |
| RLS policies | ⏳ | |
| Fonctions helper | ⏳ | |
| Edge Function déployée | ⏳ | |
| Test in-app | ⏳ | |
| Test push | ⏳ | |
| Test WhatsApp | ⏳ | |
| Contexte notifications | ⏳ | |
| Service notifications | ⏳ | |
| Matching alertes | ⏳ | |

### Problèmes rencontrés

1. ...
2. ...
3. ...

### Recommandations

1. ...
2. ...
3. ...

---

**Date du test** : ___________  
**Testeur** : ___________  
**Version** : 1.0.0
