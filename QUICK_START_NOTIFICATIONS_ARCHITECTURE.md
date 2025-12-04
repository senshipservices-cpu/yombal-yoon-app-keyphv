
# 🚀 QUICK START — Architecture Notifications Covoiturage

Guide rapide pour utiliser le système de notifications complet.

---

## 📋 PRÉREQUIS

1. ✅ Tables Supabase créées (migration appliquée)
2. ✅ Edge Function `send-notification-unified` déployée
3. ✅ Secrets Twilio configurés dans Supabase
4. ✅ Permissions notifications activées dans l'app

---

## 🎯 UTILISATION RAPIDE

### 1. Importer le service

```typescript
import {
  notifyDriverNewReservation,
  notifyPassengerReservationAccepted,
  notifyPassengerReservationRefused,
  sendReminderJMinus1,
  sendReminderHMinus1,
  notifyPassengersDriverArrived,
  notifyPassengersRideStarted,
  notifyPassengerLastMinuteCancellation,
  notifyDriverPassengerCancelled,
  notifyRideEnded,
  requestRating,
  notifyPassengerAlertMatch,
  notifyDriverRidePublished,
} from '@/utils/notificationService';
```

### 2. Envoyer une notification

#### Exemple : Nouvelle réservation

```typescript
await notifyDriverNewReservation({
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
  isUrgent: false, // true si départ < 2h (ajoute WhatsApp)
});
```

#### Exemple : Réservation acceptée

```typescript
await notifyPassengerReservationAccepted({
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
  isCloseToDepart: false, // true pour ajouter WhatsApp
});
```

#### Exemple : Rappel H-1

```typescript
await sendReminderHMinus1({
  userId: 'user_123',
  userPhone: '+221771234567',
  isDriver: true,
  route: {
    from: 'Dakar',
    to: 'Kaolack',
    date: '15 janvier 2025',
    time: '14:00',
  },
  rideId: 'ride_789',
});
```

#### Exemple : Demande de notation

```typescript
await requestRating({
  userId: 'user_123',
  isDriver: false,
  route: {
    from: 'Dakar',
    to: 'Kaolack',
  },
  rideId: 'ride_789',
});
```

---

## 🔔 TYPES DE NOTIFICATIONS

### Partie 1 : Avant et pendant la réservation

| Fonction | Canaux | Quand |
|----------|--------|-------|
| `notifyDriverNewReservation` | in-app, push, (whatsapp si urgent) | Nouvelle demande de réservation |
| `notifyPassengerReservationAccepted` | in-app, push, (whatsapp si proche) | Réservation acceptée |
| `notifyPassengerReservationRefused` | in-app, push | Réservation refusée |
| `sendReminderJMinus1` | in-app, push | 24h avant le départ |
| `sendReminderHMinus1` | in-app, push, whatsapp | 1h avant le départ |
| `notifyPassengersDriverArrived` | in-app, push, whatsapp | Conducteur arrivé au point de rencontre |

### Partie 2 : Pendant et après le trajet

| Fonction | Canaux | Quand |
|----------|--------|-------|
| `notifyPassengersRideStarted` | in-app | Trajet démarré |
| `notifyPassengerLastMinuteCancellation` | in-app, push, whatsapp | Annulation de dernière minute |
| `notifyDriverPassengerCancelled` | in-app, push | Passager annule sa réservation |
| `notifyRideEnded` | in-app | Trajet terminé |
| `requestRating` | in-app, push | 10-30 min après la fin du trajet |

### Alertes de trajets

| Fonction | Canaux | Quand |
|----------|--------|-------|
| `notifyPassengerAlertMatch` | in-app, push | Nouveau trajet correspondant à une alerte |
| `notifyDriverRidePublished` | in-app, push | Trajet publié avec succès |

---

## 📊 VÉRIFIER LES NOTIFICATIONS

### Dans l'app

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount } = useNotifications();
  
  console.log(`${unreadCount} notifications non lues`);
  console.log('Dernières notifications:', notifications.slice(0, 5));
}
```

### Dans Supabase

```sql
-- Voir les dernières notifications
SELECT * FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- Voir les logs de notifications
SELECT * FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;

-- Statistiques par canal
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, status;
```

---

## 🔧 CONFIGURATION

### 1. Secrets Supabase

```bash
# Via Supabase CLI
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886
supabase secrets set IS_PRODUCTION_MODE=true

# Vérifier
supabase secrets list
```

### 2. Permissions dans l'app

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function App() {
  const { registerForPushNotifications } = useNotifications();
  
  useEffect(() => {
    // Enregistrer l'utilisateur pour les notifications push
    registerForPushNotifications('user_123', ['driver', 'passenger']);
  }, []);
}
```

---

## 🐛 DEBUGGING

### Logs Edge Function

```bash
# Voir les logs en temps réel
supabase functions logs send-notification-unified --follow

# Logs des dernières 24h
supabase functions logs send-notification-unified
```

### Tester l'Edge Function

```bash
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "test",
    "userId": "test_user",
    "title": "Test Notification",
    "message": "This is a test",
    "channels": ["in_app", "push"]
  }'
```

### Vérifier les tokens

```sql
-- Tokens actifs par utilisateur
SELECT 
  user_id,
  platform,
  expo_push_token IS NOT NULL as has_expo_token,
  fcm_token IS NOT NULL as has_fcm_token,
  active,
  last_used_at
FROM device_tokens
WHERE user_id = 'user_123';
```

---

## ⚠️ ERREURS COURANTES

### 1. "No device tokens"

**Cause** : L'utilisateur n'a pas de token push enregistré.

**Solution** :
```typescript
await registerForPushNotifications('user_123', ['driver']);
```

### 2. "Twilio not configured"

**Cause** : Les secrets Twilio ne sont pas configurés.

**Solution** :
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 3. "User not opted in"

**Cause** : L'utilisateur n'a pas activé les notifications WhatsApp.

**Solution** :
```sql
UPDATE user_profiles
SET whatsapp_optin = true
WHERE id = 'user_123';
```

### 4. Notifications ne s'affichent pas

**Vérifier** :
1. Permissions accordées dans l'app
2. Canaux Android configurés (Android 8+)
3. Token push enregistré
4. Logs de l'Edge Function

---

## 📚 RESSOURCES

- **Documentation complète** : `PARTIE_3_ARCHITECTURE_NOTIFICATIONS_COMPLETE.md`
- **Service de notifications** : `utils/notificationService.ts`
- **Contexte notifications** : `contexts/NotificationContext.tsx`
- **Edge Function** : `supabase/functions/send-notification-unified/index.ts`

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Migration Supabase appliquée
- [ ] Edge Function déployée
- [ ] Secrets Twilio configurés
- [ ] Permissions notifications activées
- [ ] Tokens push enregistrés pour les utilisateurs
- [ ] Tests de notifications effectués
- [ ] Monitoring configuré

---

**Dernière mise à jour** : 2025-01-03
**Version** : 1.0.0
